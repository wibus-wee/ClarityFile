import i18n from '@renderer/i18n'
import { usePluginRegistryStore } from './plugin-registry'
import { pluginLoader, type PluginSource } from './plugin-loader'
import type {
  CommandPalettePlugin,
  CommandPalettePluginManifest,
  CommandPalettePluginModule,
  PluginActivationContext,
  PluginRuntimeServices,
  PluginTranslationResources
} from '../types'

interface ManagedPluginState {
  manifest: CommandPalettePluginManifest
  source: PluginSource
  identifier: string
  status: 'idle' | 'activating' | 'active' | 'failed'
  error?: Error
  module?: CommandPalettePluginModule
  plugin?: CommandPalettePlugin
  runtime?: PluginRuntimeServices
  cleanupCallbacks: Array<() => void | Promise<void>>
  activationPromise?: Promise<CommandPalettePlugin>
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function mergeTranslations(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = { ...target }

  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = mergeTranslations(result[key], value)
    } else {
      result[key] = value
    }
  }

  return result
}

export class PluginManager {
  private initialized = false
  private initializationPromise: Promise<void> | null = null
  private plugins = new Map<string, ManagedPluginState>()

  private ensureState(manifest: CommandPalettePluginManifest, source: PluginSource, module?: CommandPalettePluginModule) {
    const existing = this.plugins.get(manifest.id)
    if (existing) {
      existing.manifest = manifest
      existing.source = source
      if (module) {
        existing.module = module
      }
      return existing
    }

    const state: ManagedPluginState = {
      manifest,
      source,
      identifier: manifest.id,
      status: 'idle',
      module,
      cleanupCallbacks: []
    }

    this.plugins.set(manifest.id, state)
    return state
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    if (!this.initializationPromise) {
      this.initializationPromise = (async () => {
        const discovered = await pluginLoader.discoverBuiltinModules()
        discovered.forEach((entry) => {
          this.ensureState(entry.manifest, entry.source, entry.module)
        })
        this.initialized = true
      })()
    }

    await this.initializationPromise
  }

  getAvailablePlugins(): ManagedPluginState[] {
    return Array.from(this.plugins.values())
  }

  getManifest(pluginId: string): CommandPalettePluginManifest | undefined {
    return this.plugins.get(pluginId)?.manifest ?? pluginLoader.getManifest(pluginId)
  }

  getRuntime(pluginId: string): PluginRuntimeServices | undefined {
    return this.plugins.get(pluginId)?.runtime
  }

  async activateInitialPlugins(): Promise<void> {
    await this.initialize()

    for (const state of this.plugins.values()) {
      if (state.manifest.autoActivate === false) {
        continue
      }

      try {
        await this.activatePlugin(state.manifest.id)
      } catch (error) {
        console.error('Failed to activate plugin during initialization:', error)
      }
    }
  }

  async activatePlugin(pluginId: string): Promise<CommandPalettePlugin> {
    await this.initialize()

    const state = this.plugins.get(pluginId)
    if (!state) {
      throw new Error(`Plugin ${pluginId} is not discovered`)
    }

    if (state.status === 'active' && state.plugin) {
      return state.plugin
    }

    if (state.activationPromise) {
      return state.activationPromise
    }

    const activation = this.performActivation(state)
    state.activationPromise = activation

    try {
      const plugin = await activation
      state.activationPromise = undefined
      return plugin
    } catch (error) {
      state.activationPromise = undefined
      throw error
    }
  }

  private async performActivation(state: ManagedPluginState): Promise<CommandPalettePlugin> {
    const registry = usePluginRegistryStore.getState().actions
    const pluginId = state.manifest.id

    registry.setPluginLoading(pluginId, true)
    state.status = 'activating'
    state.error = undefined

    try {
      const module = state.module ?? (await pluginLoader.loadModule(pluginId))
      state.module = module
      state.manifest = module.manifest
      state.source = module.manifest.source ?? state.source

      await this.registerTranslations(module.manifest, module.translations)

      const runtime = this.createRuntime(state)
      state.runtime = runtime

      const activationContext: PluginActivationContext = {
        manifest: module.manifest,
        runtime
      }

      const plugin = await module.activate(activationContext)
      plugin.version = plugin.version ?? module.manifest.version
      plugin.source = plugin.source ?? (module.manifest.source ?? state.source)
      plugin.manifest = module.manifest

      state.plugin = plugin
      state.status = 'active'
      registry.registerPlugin(plugin)
      registry.setPluginLoading(pluginId, false)
      registry.setPluginError(pluginId, null)

      return plugin
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error))
      state.error = normalizedError
      state.status = 'failed'
      registry.setPluginError(pluginId, normalizedError.message)
      registry.setPluginLoading(pluginId, false)
      throw normalizedError
    }
  }

  async deactivatePlugin(pluginId: string): Promise<void> {
    const state = this.plugins.get(pluginId)
    if (!state || state.status !== 'active') {
      return
    }

    const registry = usePluginRegistryStore.getState().actions

    registry.unregisterPlugin(pluginId)

    if (state.module?.deactivate) {
      try {
        await state.module.deactivate()
      } catch (error) {
        console.error(`Error while deactivating plugin ${pluginId}:`, error)
      }
    }

    for (const cleanup of state.cleanupCallbacks.splice(0)) {
      try {
        await cleanup()
      } catch (error) {
        console.error(`Cleanup error in plugin ${pluginId}:`, error)
      }
    }

    state.plugin = undefined
    state.runtime = undefined
    state.status = 'idle'
    state.error = undefined
  }

  registerExternalPlugin(
    manifest: CommandPalettePluginManifest,
    loader: () => Promise<CommandPalettePluginModule>,
    source: PluginSource = 'user'
  ): void {
    const discovered = pluginLoader.registerExternalModule(manifest, loader, source)
    const state = this.ensureState(discovered.manifest, discovered.source, discovered.module)

    if (discovered.manifest.autoActivate !== false) {
      void this.activatePlugin(state.manifest.id)
    }
  }

  private async registerTranslations(
    manifest: CommandPalettePluginManifest,
    translations?: PluginTranslationResources
  ) {
    if (!translations) {
      return
    }

    const namespace = manifest.i18nNamespace ?? `command-palette-plugin-${manifest.id}`

    for (const [language, resources] of Object.entries(translations)) {
      const existing = ((): Record<string, any> => {
        if (i18n.hasResourceBundle(language, namespace)) {
          return i18n.getResourceBundle(language, namespace) as Record<string, any>
        }
        return {}
      })()

      const merged = mergeTranslations(existing, resources)
      i18n.addResourceBundle(language, namespace, merged, true, true)
    }

    if (typeof i18n.loadNamespaces === 'function') {
      try {
        await i18n.loadNamespaces(namespace)
      } catch (error) {
        console.warn(`Failed to load namespace ${namespace}:`, error)
      }
    }
  }

  private createRuntime(state: ManagedPluginState): PluginRuntimeServices {
    const namespace = state.manifest.i18nNamespace ?? `command-palette-plugin-${state.manifest.id}`

    const loggerPrefix = `plugin:${state.manifest.id}`
    const logger = {
      debug: (message: string, meta?: Record<string, unknown>) =>
        console.debug(`[${loggerPrefix}]`, message, meta ?? ''),
      info: (message: string, meta?: Record<string, unknown>) =>
        console.info(`[${loggerPrefix}]`, message, meta ?? ''),
      warn: (message: string, meta?: Record<string, unknown>) =>
        console.warn(`[${loggerPrefix}]`, message, meta ?? ''),
      error: (message: string, meta?: Record<string, unknown>) =>
        console.error(`[${loggerPrefix}]`, message, meta ?? '')
    }

    const i18nAdapter = {
      namespace,
      t: <T = string>(key: string, options?: any): T => {
        const { defaultValue, ...rest } = options ?? {}
        return i18n.t(`${namespace}:${key}`, {
          defaultValue,
          ...rest
        }) as T
      },
      hasKey: (key: string) => i18n.exists(`${namespace}:${key}`)
    }

    const cleanupCallbacks = state.cleanupCallbacks

    return {
      logger,
      i18n: i18nAdapter,
      registerCleanup: (callback: () => void | Promise<void>) => {
        cleanupCallbacks.push(callback)
      }
    }
  }
}

export const pluginManager = new PluginManager()
