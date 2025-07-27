import { useMemo } from 'react'
import { Command } from 'cmdk'
import {
  useCommandPaletteQuery,
  useCommandPaletteActiveCommand,
  useCommandPaletteActions
} from './stores/command-palette-store'
import { useCommandSearch } from './hooks/use-command-search'
import { useSearchableCommands } from './hooks/use-plugin-commands'
import type { Command as CommandType, CommandWithAction, RouteCommand } from './types'

/**
 * Command Palette 结果显示组件
 *
 * 功能：
 * - 渲染不同的结果部分（收藏、建议、搜索结果）
 * - 处理 "Use with..." 功能
 * - 支持键盘导航
 * - 显示插件特定的结果格式
 */
export function CommandPaletteResults() {
  const query = useCommandPaletteQuery()
  const activeCommand = useCommandPaletteActiveCommand()
  const { close, setActiveCommand } = useCommandPaletteActions()

  // 使用新的functional hooks
  const { searchResults } = useCommandSearch()
  const searchableCommands = useSearchableCommands()

  // 命令执行辅助函数
  const executeCommand = (command: CommandType) => {
    if ('action' in command) {
      ;(command as CommandWithAction).action()
      close()
    } else if ('render' in command) {
      // 激活命令视图
      setActiveCommand(command.id)
    }
  }

  // 分离路由命令和插件命令
  const routeCommands = useMemo(() => {
    return searchResults.filter((cmd) => cmd.source === 'core') as RouteCommand[]
  }, [searchResults])

  const pluginCommands = useMemo(() => {
    return searchResults.filter((cmd) => cmd.source === 'plugin')
  }, [searchResults])

  // 获取能处理当前查询的可搜索命令
  const applicableCommands = useMemo(() => {
    if (!query.trim()) return []

    return searchableCommands.filter(
      (command) => 'canHandleQuery' in command && command.canHandleQuery?.(query)
    )
  }, [searchableCommands, query])

  // 如果有激活的命令，显示命令视图
  if (activeCommand) {
    return (
      <Command.List className="max-h-[300px] overflow-y-auto">
        <div className="p-4">
          <div className="text-sm text-muted-foreground">命令视图: {activeCommand}</div>
          <div className="mt-2 text-sm">查询: &quot;{query}&quot;</div>
          {/* TODO: 这里将来会渲染命令的具体内容 */}
        </div>
      </Command.List>
    )
  }

  // 主要结果视图 - 统一使用searchResults
  return (
    <Command.List className="max-h-[300px] overflow-y-auto">
      {/* 如果没有查询，显示收藏和建议 */}
      {!query.trim() && (
        <>
          <Command.Group heading="收藏">
            <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
              <span>暂无收藏命令</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="建议">
            <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
              <span>创建新项目</span>
            </Command.Item>
            <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
              <span>搜索文件</span>
            </Command.Item>
          </Command.Group>
        </>
      )}

      {/* 统一显示搜索结果（包括无查询时的所有命令） */}
      <>
        {routeCommands.length > 0 && (
          <Command.Group heading="页面导航">
            {routeCommands.map((command) => (
              <Command.Item
                key={command.id}
                value={command.id}
                onSelect={() => {
                  executeCommand(command)
                }}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                {command.icon && <command.icon className="h-4 w-4" />}
                <span>{command.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{command.path}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {/* 插件命令结果 - 始终显示group */}
        {pluginCommands.length > 0 && (
          <Command.Group heading="命令">
            {pluginCommands.map((command) => (
              <Command.Item
                key={command.id}
                value={command.id}
                onSelect={() => {
                  executeCommand(command)
                }}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                {command.icon && <command.icon className="h-4 w-4" />}
                <span>{command.title}</span>
                {command.category && (
                  <span className="ml-auto text-xs text-muted-foreground">{command.category}</span>
                )}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {/* "Use with..." 部分 - 当有查询时始终显示 */}
        {query.trim() && (
          <Command.Group heading={`使用 "${query}" 搜索...`}>
            {applicableCommands.length > 0 ? (
              applicableCommands.map((command) => (
                <Command.Item
                  key={command.id}
                  value={`command:${command.id}`}
                  onSelect={() => {
                    // 激活命令视图并传递查询
                    setActiveCommand(command.id)
                  }}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  {command.icon && <command.icon className="h-4 w-4" />}
                  <span>{command.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {command.category || '搜索'}
                  </span>
                </Command.Item>
              ))
            ) : (
              <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground">
                <span>无可用的搜索命令</span>
              </Command.Item>
            )}
          </Command.Group>
        )}
      </>
    </Command.List>
  )
}
