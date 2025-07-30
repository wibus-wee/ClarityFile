import { useCallback, useMemo } from 'react'
import { useFavoritesData } from './use-command-palette-data'
import { useAllCommands } from '../stores/command-palette-store'
import type { Command } from '../types'

/**
 * Command Favorites Hook
 *
 * Single responsibility: Handle favorite commands management
 */
export function useCommandFavorites() {
  const { favorites, addToFavorites, removeFromFavorites, isLoadingFavorites } = useFavoritesData()
  const allCommands = useAllCommands()

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (commandId: string) => {
      if (favorites.includes(commandId)) {
        await removeFromFavorites(commandId)
      } else {
        await addToFavorites(commandId)
      }
    },
    [favorites, removeFromFavorites, addToFavorites]
  )

  // Check if command is favorited
  const isFavorite = useCallback(
    (commandId: string) => {
      return favorites.includes(commandId)
    },
    [favorites]
  )

  // Get favorite commands with full command data
  const favoriteCommands = useMemo(() => {
    return favorites
      .map((commandId: string) => allCommands.find((cmd: Command) => cmd.id === commandId))
      .filter((cmd: Command | undefined): cmd is Command => cmd !== undefined)
  }, [favorites, allCommands])

  return {
    favorites,
    favoriteCommands,
    toggleFavorite,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    isLoadingFavorites
  }
}
