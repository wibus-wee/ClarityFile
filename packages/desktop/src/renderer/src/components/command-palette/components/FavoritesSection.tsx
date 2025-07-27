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
  const { favoriteCommands } = useCommandFavorites()

  return (
    <Command.Group heading="收藏">
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
        <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
          <span className="text-muted-foreground">暂无收藏命令</span>
        </Command.Item>
      )}
    </Command.Group>
  )
}
