import type { Command, CommandPalettePlugin, PluginConfig } from '../types'

/**
 * 创建插件命令 - 纯函数替换CommandRegistry类
 */
export function createPluginCommands(
  plugins: CommandPalettePlugin[],
  configs: Record<string, PluginConfig>
): Command[] {
  return plugins
    .filter((plugin) => configs[plugin.id]?.enabled !== false)
    .flatMap((plugin) => {
      const commands = plugin.publishCommands?.() || []
      return commands.map((cmd) => ({
        ...cmd,
        source: 'plugin' as const,
        pluginId: plugin.id
      }))
    })
}
