import { useCallback, useMemo } from 'react'
import { usePluginRegistry } from '../plugins/plugin-registry'
import { useCommandPaletteData } from './use-command-palette-data'
import type { CommandPalettePlugin, PluginConfig } from '../types'

/**
 * Plugin Management Hook
 *
 * Single responsibility: Handle plugin registration and configuration
 */
export function usePluginManagement() {
  const pluginRegistry = usePluginRegistry()
  const {
    pluginConfigs,
    updatePluginConfig,
    batchUpdateConfigs,
    isUpdatingConfig,
    isBatchUpdating
  } = useCommandPaletteData()

  // Register plugin
  const registerPlugin = useCallback(
    (plugin: CommandPalettePlugin) => {
      pluginRegistry.registerPlugin(plugin)
    },
    [pluginRegistry]
  )

  // Unregister plugin
  const unregisterPlugin = useCallback(
    (pluginId: string) => {
      pluginRegistry.unregisterPlugin(pluginId)
    },
    [pluginRegistry]
  )

  // Get plugin statistics
  const pluginStats = useMemo(() => {
    const allRegisteredPlugins = pluginRegistry.getAllPlugins()
    const enabledPlugins = pluginRegistry.getEnabledPlugins(pluginConfigs)

    return {
      total: allRegisteredPlugins.length,
      enabled: enabledPlugins.length,
      disabled: allRegisteredPlugins.length - enabledPlugins.length
    }
  }, [pluginRegistry, pluginConfigs])

  // Reset all plugin configurations to defaults
  const resetPluginConfigs = useCallback(async () => {
    const defaultConfigs: Record<string, PluginConfig> = {}
    const allRegisteredPlugins = pluginRegistry.getAllPlugins()

    allRegisteredPlugins.forEach((plugin, index) => {
      defaultConfigs[plugin.id] = {
        id: plugin.id,
        enabled: true,
        order: index
      }
    })

    await batchUpdateConfigs(defaultConfigs)
  }, [pluginRegistry, batchUpdateConfigs])

  return {
    // Plugin registry operations
    registerPlugin,
    unregisterPlugin,

    // Configuration management
    pluginConfigs,
    updatePluginConfig,
    batchUpdateConfigs,
    resetPluginConfigs,

    // Statistics
    pluginStats,

    // Loading states
    isUpdatingConfig,
    isBatchUpdating
  }
}
