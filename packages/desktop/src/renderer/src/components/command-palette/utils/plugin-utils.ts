import type { CommandPalettePlugin } from '../types'

/**
 * 插件相关的工具函数
 */
export const pluginUtils = {
  /**
   * 根据插件ID获取插件名称
   * @param pluginId 插件ID
   * @param registeredPlugins 已注册的插件列表
   * @returns 插件名称，如果找不到则返回插件ID
   */
  getPluginName: (pluginId: string, registeredPlugins: CommandPalettePlugin[]): string => {
    const plugin = registeredPlugins.find((p) => p.id === pluginId)
    return plugin?.name || pluginId
  },

  /**
   * 根据插件ID获取插件描述
   * @param pluginId 插件ID
   * @param registeredPlugins 已注册的插件列表
   * @returns 插件描述，如果找不到则返回空字符串
   */
  getPluginDescription: (pluginId: string, registeredPlugins: CommandPalettePlugin[]): string => {
    const plugin = registeredPlugins.find((p) => p.id === pluginId)
    return plugin?.description || ''
  },

  /**
   * 根据插件ID获取完整的插件信息
   * @param pluginId 插件ID
   * @param registeredPlugins 已注册的插件列表
   * @returns 插件信息，如果找不到则返回null
   */
  getPlugin: (
    pluginId: string,
    registeredPlugins: CommandPalettePlugin[]
  ): CommandPalettePlugin | null => {
    return registeredPlugins.find((p) => p.id === pluginId) || null
  },

  /**
   * 检查插件是否已注册
   * @param pluginId 插件ID
   * @param registeredPlugins 已注册的插件列表
   * @returns 是否已注册
   */
  isPluginRegistered: (pluginId: string, registeredPlugins: CommandPalettePlugin[]): boolean => {
    return registeredPlugins.some((p) => p.id === pluginId)
  },

  /**
   * 获取所有插件的ID列表
   * @param registeredPlugins 已注册的插件列表
   * @returns 插件ID列表
   */
  getAllPluginIds: (registeredPlugins: CommandPalettePlugin[]): string[] => {
    return registeredPlugins.map((p) => p.id)
  },

  /**
   * 根据名称搜索插件
   * @param searchTerm 搜索词
   * @param registeredPlugins 已注册的插件列表
   * @returns 匹配的插件列表
   */
  searchPlugins: (
    searchTerm: string,
    registeredPlugins: CommandPalettePlugin[]
  ): CommandPalettePlugin[] => {
    const term = searchTerm.toLowerCase()
    return registeredPlugins.filter(
      (plugin) =>
        plugin.name.toLowerCase().includes(term) ||
        plugin.description.toLowerCase().includes(term) ||
        plugin.id.toLowerCase().includes(term)
    )
  }
}

/**
 * 使用插件工具的 Hook
 * 提供便捷的插件信息获取方法
 */
export function usePluginUtils(registeredPlugins: CommandPalettePlugin[]) {
  return {
    getPluginName: (pluginId: string) => pluginUtils.getPluginName(pluginId, registeredPlugins),
    getPluginDescription: (pluginId: string) =>
      pluginUtils.getPluginDescription(pluginId, registeredPlugins),
    getPlugin: (pluginId: string) => pluginUtils.getPlugin(pluginId, registeredPlugins),
    isPluginRegistered: (pluginId: string) =>
      pluginUtils.isPluginRegistered(pluginId, registeredPlugins),
    getAllPluginIds: () => pluginUtils.getAllPluginIds(registeredPlugins),
    searchPlugins: (searchTerm: string) => pluginUtils.searchPlugins(searchTerm, registeredPlugins)
  }
}
