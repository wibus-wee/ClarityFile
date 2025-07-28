import React from 'react'
import { Command } from 'cmdk'
import { useCommandFavorites } from '../hooks/use-command-favorites'
import { useRegisteredPlugins } from '../plugins/plugin-registry'
import { usePluginUtils } from '../utils/plugin-utils'
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
  const { toggleFavorite } = useCommandFavorites()
  const registeredPlugins = useRegisteredPlugins()
  const { getPluginName } = usePluginUtils(registeredPlugins)

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

      <div className="flex flex-row gap-4 flex-1 min-w-0">
        <div className="truncate">{command.title}</div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Show plugin name for plugin commands */}
          {command.source === 'plugin' && command.pluginId && (
            <span className="text-xs text-muted-foreground">{getPluginName(command.pluginId)}</span>
          )}

          {/* Show "Core" for core commands without path */}
          {command.source === 'core' && !('path' in command) && (
            <span className="text-xs text-muted-foreground">Core</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {'path' in command && <span className="text-xs text-muted-foreground">Navigation</span>}

        {command.source === 'plugin' && command.pluginId && (
          <span className="text-xs text-muted-foreground">Command</span>
        )}
      </div>
    </Command.Item>
  )
}
