import type { Command, CommandPalettePlugin, PluginConfig } from '../types'
import { generatePinyin } from './route-commands'

/**
 * 为插件命令生成增强的关键词（包含拼音）
 */
function enhancePluginCommandKeywords(cmd: Command, plugin: CommandPalettePlugin): string[] {
  const originalKeywords = cmd.keywords || []
  const titlePinyin = generatePinyin(cmd.title)
  const subtitlePinyin = cmd.subtitle ? generatePinyin(cmd.subtitle) : []

  // 添加插件相关的关键词
  const pluginNamePinyin = generatePinyin(plugin.name)
  const pluginKeywords = [plugin.name, plugin.description, ...pluginNamePinyin]

  return [...originalKeywords, ...titlePinyin, ...subtitlePinyin, ...pluginKeywords]
}

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
        pluginId: plugin.id,
        keywords: enhancePluginCommandKeywords(cmd, plugin),
        pinyin: generatePinyin(cmd.title)
      }))
    })
}
