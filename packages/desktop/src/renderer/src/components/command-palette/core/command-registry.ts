import Fuse, { type IFuseOptions } from 'fuse.js'
import { PluginRegistry } from '../plugins/plugin-registry'
import type { Command, CommandPalettePlugin, PluginConfig } from '../types'

/**
 * 命令注册表类
 *
 * 功能：
 * - 管理插件发布的命令
 * - 支持插件的启用/禁用
 * - 提供命令搜索功能
 * - 管理可搜索插件列表
 */
export class CommandRegistry {
  private commands = new Map<string, Command>()
  private fuse: Fuse<Command> | null = null
  private pluginRegistry: PluginRegistry

  constructor(pluginConfigs: Record<string, PluginConfig>) {
    this.pluginRegistry = new PluginRegistry(pluginConfigs)
  }

  /**
   * 注册插件
   */
  registerPlugin(plugin: CommandPalettePlugin) {
    this.pluginRegistry.register(plugin)
    this.refreshCommands(plugin)
    this.initializeFuse()
  }

  /**
   * 注销插件
   */
  unregisterPlugin(pluginId: string) {
    // 清除该插件的所有命令
    for (const [commandId, command] of this.commands.entries()) {
      if (command.pluginId === pluginId) {
        this.commands.delete(commandId)
      }
    }

    this.pluginRegistry.unregister(pluginId)
    this.initializeFuse()
  }

  /**
   * 搜索命令
   */
  search(query: string): Command[] {
    if (!query.trim()) {
      return Array.from(this.commands.values())
    }

    if (!this.fuse) {
      return []
    }

    const results = this.fuse.search(query)
    return results.map((result) => result.item)
  }

  /**
   * 获取所有命令
   */
  getAllCommands(): Command[] {
    return Array.from(this.commands.values())
  }

  /**
   * 获取可搜索的插件列表
   */
  getSearchablePlugins(): CommandPalettePlugin[] {
    return this.pluginRegistry.getSearchable()
  }

  /**
   * 获取插件
   */
  getPlugin(pluginId: string): CommandPalettePlugin | undefined {
    return this.pluginRegistry.get(pluginId)
  }

  /**
   * 获取能处理特定查询的插件
   */
  getPluginsForQuery(query: string): CommandPalettePlugin[] {
    return this.pluginRegistry.getPluginsForQuery(query)
  }

  /**
   * 更新插件配置
   */
  updateConfigs(newConfigs: Record<string, PluginConfig>) {
    this.pluginRegistry.updateConfigs(newConfigs)
    // 重新刷新所有插件的命令
    for (const plugin of this.pluginRegistry.getAll()) {
      this.refreshCommands(plugin)
    }
    this.initializeFuse()
  }

  /**
   * 刷新插件命令
   */
  private refreshCommands(plugin: CommandPalettePlugin) {
    // 清除该插件的现有命令
    for (const [commandId, command] of this.commands.entries()) {
      if (command.pluginId === plugin.id) {
        this.commands.delete(commandId)
      }
    }

    // 如果插件启用且有命令，则注册命令
    const config = this.pluginRegistry.getConfig(plugin.id)
    if (config?.enabled !== false && plugin.publishCommands) {
      const commands = plugin.publishCommands()
      commands.forEach((cmd) => {
        this.commands.set(cmd.id, {
          ...cmd,
          source: 'plugin',
          pluginId: plugin.id
        })
      })
    }
  }

  /**
   * 初始化 Fuse.js 搜索引擎
   */
  private initializeFuse() {
    const fuseOptions: IFuseOptions<Command> = {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'keywords', weight: 0.3 },
        { name: 'category', weight: 0.2 }
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: true
    }

    this.fuse = new Fuse(Array.from(this.commands.values()), fuseOptions)
  }
}
