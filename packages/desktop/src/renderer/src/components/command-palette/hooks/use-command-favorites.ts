import { useCallback, useMemo } from 'react'
import { useFavoritesData } from './use-command-palette-data'

/**
 * Command Favorites Hook
 *
 * Single responsibility: Handle favorite commands management
 */
export function useCommandFavorites() {
  const { favorites, addToFavorites, removeFromFavorites, isLoadingFavorites } = useFavoritesData()

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

  // Get favorite commands with metadata
  const favoriteCommands = useMemo(() => {
    return favorites.map((commandId) => ({
      commandId,
      isFavorite: true
    }))
  }, [favorites])

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
