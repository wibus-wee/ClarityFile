import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Command } from 'cmdk'
import { useSearchableCommands } from '../stores/command-palette-store'
import type { CommandWithRender } from '../types'
import { CommandItem } from './CommandItem'

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
  const { t } = useTranslation('command-palette')
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
    <Command.Group
      heading={t('sections.useWith', { query })}
      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground/80"
    >
      {applicableCommands.length > 0 ? (
        applicableCommands.map((command) => (
          <CommandItem
            key={command.id}
            command={{
              ...command,
              id: `use-with:${command.id}`
            }}
            onSelect={() => onCommandSelect(command)}
          />
        ))
      ) : (
        <Command.Item className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground/70">
          <span className="font-medium">{t('empty.noSearchCommands')}</span>
        </Command.Item>
      )}
    </Command.Group>
  )
}
