import { usePluginRegistryStore } from './plugin-registry'
import { pluginManager } from './plugin-manager'

let initializationPromise: Promise<boolean> | null = null

export function initializePlugins(): Promise<boolean> {
  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = (async () => {
    const registry = usePluginRegistryStore.getState().actions

    try {
      console.log('🔌 Initializing Command Palette plugins...')
      await pluginManager.initialize()
      await pluginManager.activateInitialPlugins()
      registry.initialize()

      const available = pluginManager.getAvailablePlugins()
      console.log(
        `🎉 Plugin initialization completed. Loaded ${available.length} plugin(s).`,
        available.map((plugin) => plugin.manifest.id)
      )

      return true
    } catch (error) {
      console.error('❌ Plugin initialization failed:', error)
      registry.setPluginError(
        'initialization',
        error instanceof Error ? error.message : 'Unknown initialization error'
      )
      return false
    }
  })()

  return initializationPromise
}
