import type {
  CommandPalettePluginManifest,
  CommandPalettePluginModule
} from '../types'

export type PluginSource = 'builtin' | 'user' | 'remote'

type PluginModuleExport = {
  default?: CommandPalettePluginModule
  commandPalettePluginModule?: CommandPalettePluginModule
}

type PluginModuleFactory = () => Promise<PluginModuleExport>

const builtinPluginModuleFactories: Record<string, PluginModuleFactory> = {
  ...(import.meta.glob<PluginModuleExport>('./**/*.plugin.ts', { eager: false }) as Record<
    string,
    PluginModuleFactory
  >),
  ...(import.meta.glob<PluginModuleExport>('./**/*.plugin.tsx', { eager: false }) as Record<
    string,
    PluginModuleFactory
  >)
}

function resolveModule(moduleExport: PluginModuleExport, identifier: string): CommandPalettePluginModule {
  const pluginModule = moduleExport.default ?? moduleExport.commandPalettePluginModule
  if (!pluginModule) {
    throw new Error(`Plugin module "${identifier}" does not export a valid module instance`)
  }
  return pluginModule
}

export interface DiscoveredPluginModule {
  manifest: CommandPalettePluginManifest
  source: PluginSource
  identifier: string
  loader: () => Promise<CommandPalettePluginModule>
  module?: CommandPalettePluginModule
}

export class PluginLoader {
  private builtinModules = new Map<string, DiscoveredPluginModule>()
  private externalModules = new Map<string, DiscoveredPluginModule>()

  async discoverBuiltinModules(): Promise<DiscoveredPluginModule[]> {
    if (this.builtinModules.size > 0) {
      return Array.from(this.builtinModules.values())
    }

    const discoveryPromises = Object.entries(builtinPluginModuleFactories).map(
      async ([identifier, factory]) => {
        const loader = async () => {
          const moduleExport = await factory()
          return resolveModule(moduleExport, identifier)
        }

        const module = await loader()
        const manifest = {
          ...module.manifest,
          source: module.manifest.source ?? 'builtin'
        }

        const discovered: DiscoveredPluginModule = {
          manifest,
          identifier,
          source: manifest.source ?? 'builtin',
          loader: async () => {
            if (discovered.module) {
              return discovered.module
            }
            const loaded = await loader()
            discovered.module = loaded
            return loaded
          },
          module
        }

        this.builtinModules.set(manifest.id, discovered)
        return discovered
      }
    )

    await Promise.all(discoveryPromises)
    return Array.from(this.builtinModules.values())
  }

  registerExternalModule(
    manifest: CommandPalettePluginManifest,
    loader: () => Promise<CommandPalettePluginModule>,
    source: PluginSource = 'user'
  ): DiscoveredPluginModule {
    const normalizedManifest: CommandPalettePluginManifest = {
      ...manifest,
      source: manifest.source ?? source
    }

    const discovered: DiscoveredPluginModule = {
      manifest: normalizedManifest,
      source,
      identifier: manifest.id,
      loader: async () => {
        if (discovered.module) {
          return discovered.module
        }

        const module = await loader()

        if (module.manifest.id !== manifest.id) {
          console.warn(
            `Plugin manifest id mismatch for ${manifest.id}. Received ${module.manifest.id}. Using loader manifest.`
          )
        }

        discovered.module = module
        discovered.manifest = { ...module.manifest, source: module.manifest.source ?? source }
        return module
      }
    }

    this.externalModules.set(manifest.id, discovered)
    return discovered
  }

  getDiscoveredModules(): DiscoveredPluginModule[] {
    return [...this.builtinModules.values(), ...this.externalModules.values()]
  }

  getManifest(pluginId: string): CommandPalettePluginManifest | undefined {
    const entry = this.builtinModules.get(pluginId) ?? this.externalModules.get(pluginId)
    return entry?.manifest
  }

  async loadModule(pluginId: string): Promise<CommandPalettePluginModule> {
    const entry = this.builtinModules.get(pluginId) ?? this.externalModules.get(pluginId)
    if (!entry) {
      throw new Error(`Plugin ${pluginId} is not registered with the loader`)
    }

    if (entry.module) {
      return entry.module
    }

    const module = await entry.loader()
    entry.module = module
    entry.manifest = { ...module.manifest, source: module.manifest.source ?? entry.source }
    return module
  }
}

export const pluginLoader = new PluginLoader()
