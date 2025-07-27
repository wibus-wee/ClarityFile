import React from 'react'
import { Command } from 'cmdk'
import { useCommandFavorites } from '../hooks/use-command-favorites'
import type { Command as CommandType, RouteCommand } from '../types'

interface CommandItemProps {
  command: CommandType | RouteCommand
  onSelect: () => void
  showFavorite?: boolean
}

/**
 * Enhanced Command Item Component
 *
 * Features:
 * - Shows favorite status
 * - Supports favorite toggle on right-click or keyboard shortcut
 * - Displays command metadata
 */
export function CommandItem({ command, onSelect, showFavorite = true }: CommandItemProps) {
  const { isFavorite, toggleFavorite } = useCommandFavorites()
  const isCommandFavorite = isFavorite(command.id)

  const handleRightClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (showFavorite) {
      await toggleFavorite(command.id)
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    // Toggle favorite with Cmd/Ctrl + F
    if ((e.metaKey || e.ctrlKey) && e.key === 'f' && showFavorite) {
      e.preventDefault()
      e.stopPropagation()
      await toggleFavorite(command.id)
    }
  }

  return (
    <Command.Item
      key={command.id}
      value={command.id}
      onSelect={onSelect}
      onContextMenu={handleRightClick}
      onKeyDown={handleKeyDown}
      className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer"
    >
      {command.icon && <command.icon className="h-4 w-4 shrink-0" />}

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{command.title}</div>
        {command.subtitle && (
          <div className="text-xs text-muted-foreground truncate">{command.subtitle}</div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {showFavorite && isCommandFavorite && (
          <span className="text-yellow-500" title="收藏的命令">
            ⭐
          </span>
        )}

        {/* Show path for route commands */}
        {'path' in command && <span className="text-xs text-muted-foreground">{command.path}</span>}

        {/* Show category for plugin commands */}
        {command.category && !('path' in command) && (
          <span className="text-xs text-muted-foreground">{command.category}</span>
        )}
      </div>
    </Command.Item>
  )
}
