import { CommandPalettePlugin, PluginConfig } from '../types'

/**
 * 插件注册表类
 *
 * 功能：
 * - 管理插件的注册和注销
 * - 提供插件查找和过滤功能
 * - 处理插件配置更新
 * - 支持插件的启用/禁用
 */
export class PluginRegistry {
  private plugins = new Map<string, CommandPalettePlugin>()
  private pluginConfigs: Record<string, PluginConfig>

  constructor(initialConfigs: Record<string, PluginConfig> = {}) {
    this.pluginConfigs = initialConfigs
  }

  /**
   * 注册插件
   */
  register(plugin: CommandPalettePlugin): void {
    try {
      // 验证插件接口
      this.validatePlugin(plugin)

      // 注册插件
      this.plugins.set(plugin.id, plugin)

      // 如果没有配置，创建默认配置
      if (!this.pluginConfigs[plugin.id]) {
        this.pluginConfigs[plugin.id] = this.createDefaultConfig(plugin)
      }

      console.log(`Plugin registered: ${plugin.id}`)
    } catch (error) {
      console.error(`Failed to register plugin ${plugin.id}:`, error)
      // 插件注册失败不应该影响整个系统
    }
  }

  /**
   * 注销插件
   */
  unregister(pluginId: string): void {
    if (this.plugins.has(pluginId)) {
      this.plugins.delete(pluginId)
      console.log(`Plugin unregistered: ${pluginId}`)
    }
  }

  /**
   * 获取插件
   */
  get(pluginId: string): CommandPalettePlugin | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * 获取所有插件
   */
  getAll(): CommandPalettePlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 获取启用的插件
   */
  getEnabled(): CommandPalettePlugin[] {
    return this.getAll().filter((plugin) => {
      const config = this.pluginConfigs[plugin.id]
      return config?.enabled !== false
    })
  }

  /**
   * 获取可搜索的插件
   */
  getSearchable(): CommandPalettePlugin[] {
    return this.getEnabled()
      .filter((plugin) => {
        const config = this.pluginConfigs[plugin.id]
        return config?.searchable !== false && plugin.searchable
      })
      .sort((a, b) => {
        const configA = this.pluginConfigs[a.id]
        const configB = this.pluginConfigs[b.id]
        return (configA?.order || 0) - (configB?.order || 0)
      })
  }

  /**
   * 获取能处理特定查询的插件
   */
  getPluginsForQuery(query: string): CommandPalettePlugin[] {
    return this.getSearchable().filter((plugin) => {
      if (!plugin.canHandleQuery) {
        return true // 如果没有定义 canHandleQuery，默认可以处理
      }
      try {
        return plugin.canHandleQuery(query)
      } catch (error) {
        console.error(`Error in plugin ${plugin.id} canHandleQuery:`, error)
        return false
      }
    })
  }

  /**
   * 更新插件配置
   */
  updateConfigs(newConfigs: Record<string, PluginConfig>): void {
    this.pluginConfigs = { ...this.pluginConfigs, ...newConfigs }
  }

  /**
   * 获取插件配置
   */
  getConfig(pluginId: string): PluginConfig | undefined {
    return this.pluginConfigs[pluginId]
  }

  /**
   * 获取所有插件配置
   */
  getAllConfigs(): Record<string, PluginConfig> {
    return { ...this.pluginConfigs }
  }

  /**
   * 验证插件接口
   */
  private validatePlugin(plugin: CommandPalettePlugin): void {
    if (!plugin.id) {
      throw new Error('Plugin must have an id')
    }
    if (!plugin.name) {
      throw new Error('Plugin must have a name')
    }
    if (!plugin.description) {
      throw new Error('Plugin must have a description')
    }
    if (!Array.isArray(plugin.keywords)) {
      throw new Error('Plugin must have keywords array')
    }
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id ${plugin.id} is already registered`)
    }
  }

  /**
   * 创建默认插件配置
   */
  private createDefaultConfig(plugin: CommandPalettePlugin): PluginConfig {
    return {
      id: plugin.id,
      enabled: true,
      searchable: plugin.searchable ?? false,
      order: this.plugins.size
    }
  }

  /**
   * 重置所有插件配置为默认值
   */
  resetConfigs(): void {
    this.pluginConfigs = {}
    for (const plugin of this.plugins.values()) {
      this.pluginConfigs[plugin.id] = this.createDefaultConfig(plugin)
    }
  }

  /**
   * 获取插件统计信息
   */
  getStats() {
    const total = this.plugins.size
    const enabled = this.getEnabled().length
    const searchable = this.getSearchable().length

    return {
      total,
      enabled,
      disabled: total - enabled,
      searchable,
      nonSearchable: enabled - searchable
    }
  }

  /**
   * 清理所有插件和配置
   * 用于组件卸载时防止内存泄漏
   */
  dispose(): void {
    this.plugins.clear()
    this.pluginConfigs = {}
  }
}
