import { useTranslation } from 'react-i18next'
import { Command } from 'cmdk'
import { useCommandRecommendations } from '../hooks/use-command-recommendations'
import type { Command as CommandType } from '../types'
import { CommandItem } from './CommandItem'

/**
 * 建议命令区域组件
 *
 * 功能：
 * - 基于用户行为的智能推荐
 */
interface SuggestionsSectionProps {
  onCommandExecute?: (command: CommandType) => void
}

export function SuggestionsSection({ onCommandExecute }: SuggestionsSectionProps) {
  const { t } = useTranslation('command-palette')
  // 获取智能推荐
  const { recommendations } = useCommandRecommendations({
    maxSuggestions: 5, // 只显示智能推荐
    debugMode: false
  })

  // 如果没有推荐，不显示这个区域
  if (recommendations.length === 0) {
    return null
  }

  return (
    <Command.Group
      heading={t('sections.suggestions')}
      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground/80"
    >
      {recommendations.map((rec) => (
        <CommandItem
          key={`rec-${rec.command.id}`}
          command={{
            ...rec.command,
            id: `rec-${rec.command.id}` // 给收藏命令添加前缀避免ID冲突
          }}
          onSelect={() => onCommandExecute?.(rec.command)}
          showFavorite={false} // 在收藏区域不显示收藏图标，避免重复
        />
      ))}
    </Command.Group>
  )
}
