import { useTranslation } from 'react-i18next'
import { Command } from 'cmdk'
import { CommandItem } from './CommandItem'
import { useCommandFavorites } from '../hooks/use-command-favorites'
import type { Command as CommandType } from '../types'

/**
 * 收藏命令区域组件
 *
 * 功能：
 * - 显示用户收藏的命令
 * - 处理收藏命令的执行
 */
interface FavoritesSectionProps {
  onExecuteCommand: (command: CommandType) => void
}

export function FavoritesSection({ onExecuteCommand }: FavoritesSectionProps) {
  const { t } = useTranslation('command-palette')
  const { favoriteCommands } = useCommandFavorites()

  return (
    <Command.Group
      heading={t('sections.favorites')}
      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground/80"
    >
      {favoriteCommands.length > 0 ? (
        favoriteCommands.map((command: CommandType) => (
          <CommandItem
            key={`favorite-${command.id}`}
            command={{
              ...command,
              id: `favorite-${command.id}` // 给收藏命令添加前缀避免ID冲突
            }}
            onSelect={() => onExecuteCommand(command)}
            showFavorite={false} // 在收藏区域不显示收藏图标，避免重复
          />
        ))
      ) : (
        <Command.Item className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent/60 aria-selected:text-accent-foreground">
          <span className="text-muted-foreground/70 font-medium">{t('empty.noFavorites')}</span>
        </Command.Item>
      )}
    </Command.Group>
  )
}
