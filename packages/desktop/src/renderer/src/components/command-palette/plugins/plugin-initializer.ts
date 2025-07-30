import type { CommandPalettePlugin } from '../types'
import { HelloWorldPlugin } from './HelloWorld'
import { FileSearchPlugin } from './FileSearch'

/**
 * 所有可用的插件列表
 *
 * 在这里注册所有的命令面板插件
 */
export const AVAILABLE_PLUGINS: CommandPalettePlugin[] = [
  HelloWorldPlugin,
  FileSearchPlugin
  // TODO: 添加更多插件
  // ThemesStudioPlugin,
]

/**
 * 插件初始化器
 *
 * 负责：
 * - 注册所有可用插件
 * - 处理插件加载错误
 * - 提供插件发现功能
 */
export class PluginInitializer {
  /**
   * 获取所有可用插件
   */
  static getAvailablePlugins(): CommandPalettePlugin[] {
    return AVAILABLE_PLUGINS
  }

  /**
   * 获取插件数量
   */
  static getPluginCount(): number {
    return AVAILABLE_PLUGINS.length
  }

  /**
   * 根据ID查找插件
   */
  static findPluginById(pluginId: string): CommandPalettePlugin | undefined {
    return AVAILABLE_PLUGINS.find((plugin) => plugin.id === pluginId)
  }

  /**
   * 验证插件是否有效
   */
  static validatePlugin(plugin: CommandPalettePlugin): boolean {
    try {
      // 基本字段验证
      if (!plugin.id || !plugin.name || !plugin.description) {
        console.error(`Plugin validation failed: Missing required fields`, plugin)
        return false
      }

      // 检查 publishCommands 方法
      if (typeof plugin.publishCommands !== 'function') {
        console.error(`Plugin validation failed: publishCommands is not a function`, plugin)
        return false
      }

      // 尝试调用 publishCommands
      const commands = plugin.publishCommands()
      if (!Array.isArray(commands)) {
        console.error(`Plugin validation failed: publishCommands must return an array`, plugin)
        return false
      }

      // 验证每个命令
      for (const command of commands) {
        if (!command.id || !command.title) {
          console.error(`Plugin validation failed: Command missing required fields`, command)
          return false
        }

        // 验证命令类型（action 或 render，但不能同时有）
        const hasAction = 'action' in command && typeof command.action === 'function'
        const hasRender = 'render' in command && typeof command.render === 'function'

        if (!hasAction && !hasRender) {
          console.error(
            `Plugin validation failed: Command must have either action or render`,
            command
          )
          return false
        }

        if (hasAction && hasRender) {
          console.error(
            `Plugin validation failed: Command cannot have both action and render`,
            command
          )
          return false
        }
      }

      return true
    } catch (error) {
      console.error(`Plugin validation failed with error:`, error, plugin)
      return false
    }
  }

  /**
   * 获取有效的插件列表
   */
  static getValidPlugins(): CommandPalettePlugin[] {
    return AVAILABLE_PLUGINS.filter((plugin) => this.validatePlugin(plugin))
  }

  /**
   * 获取插件统计信息
   */
  static getPluginStats() {
    const total = AVAILABLE_PLUGINS.length
    const valid = this.getValidPlugins().length
    const invalid = total - valid

    return {
      total,
      valid,
      invalid,
      plugins: AVAILABLE_PLUGINS.map((plugin) => ({
        id: plugin.id,
        name: plugin.name,
        isValid: this.validatePlugin(plugin)
      }))
    }
  }
}
