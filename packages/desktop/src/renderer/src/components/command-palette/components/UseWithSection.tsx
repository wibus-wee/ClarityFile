import { useMemo } from 'react'
import { Command } from 'cmdk'
import { useSearchableCommands } from '../stores/command-palette-store'
import type { CommandWithRender } from '../types'

/**
 * "Use with..." 区域组件
 *
 * 功能：
 * - 显示可以处理当前查询的命令
 * - 提供插件搜索功能的入口
 */
interface UseWithSectionProps {
  query: string
  onCommandSelect: (command: CommandWithRender) => void
}

export function UseWithSection({ query, onCommandSelect }: UseWithSectionProps) {
  const searchableCommands = useSearchableCommands()

  // 获取能处理当前查询的可搜索命令
  const applicableCommands = useMemo(() => {
    if (!query.trim()) return []

    return searchableCommands.filter(
      (command): command is CommandWithRender =>
        'canHandleQuery' in command &&
        command.canHandleQuery !== undefined &&
        command.canHandleQuery(query)
    )
  }, [searchableCommands, query])

  // 如果没有查询或没有可用命令，不渲染
  if (!query.trim()) {
    return null
  }

  return (
    <Command.Group heading={`使用 "${query}" 搜索...`}>
      {applicableCommands.length > 0 ? (
        applicableCommands.map((command) => (
          <Command.Item
            key={command.id}
            value={`use-with:${command.id}`}
            onSelect={() => onCommandSelect(command)}
            className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer"
          >
            {command.icon && <command.icon className="h-4 w-4 shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{command.title}</div>
              {command.subtitle && (
                <div className="text-xs text-muted-foreground truncate">{command.subtitle}</div>
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
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
  )
}
