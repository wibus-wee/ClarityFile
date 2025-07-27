import type { Command, CommandPalettePlugin, PluginConfig } from '../types'

/**
 * 创建插件命令 - 纯函数替换CommandRegistry类
 */
export function createPluginCommands(
  plugins: CommandPalettePlugin[],
  configs: Record<string, PluginConfig>
): Command[] {
  return plugins
    .filter(plugin => configs[plugin.id]?.enabled !== false)
    .flatMap(plugin => {
      const commands = plugin.publishCommands?.() || []
      return commands.map(cmd => ({ 
        ...cmd, 
        source: 'plugin' as const,
        pluginId: plugin.id
      }))
    })
}

/**
 * 获取可搜索的命令 - 用于"Use with..."功能
 */
export function getSearchableCommands(
  commands: Command[]
): Command[] {
  return commands.filter((command): command is Command => 
    'render' in command && command.canHandleQuery !== undefined
  )
}

/**
 * 搜索命令 - 纯函数实现
 */
export function searchCommands(
  commands: Command[], 
  query: string
): Command[] {
  if (!query.trim()) return []
  
  // 简单的搜索实现，可以后续集成Fuse.js
  const lowerQuery = query.toLowerCase()
  
  return commands.filter(command => {
    const searchText = [
      command.title,
      command.subtitle || '',
      command.category || '',
      ...command.keywords
    ].join(' ').toLowerCase()
    
    return searchText.includes(lowerQuery)
  })
}
