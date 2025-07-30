import { useCallback } from 'react'
import { useCommandPaletteActions } from '../stores/command-palette-store'
import { useFavoritesData } from './use-command-palette-data'

/**
 * Command Execution Hook
 *
 * Single responsibility: Handle command execution and tracking
 */
export function useCommandExecution() {
  const { close } = useCommandPaletteActions()
  const { trackCommand } = useFavoritesData()

  const executeCommand = useCallback(
    async (commandId: string, command: () => void | Promise<void>) => {
      try {
        await command()
        await trackCommand({ commandId })
        close() // Close palette after successful execution
      } catch (error) {
        console.error(`Failed to execute command ${commandId}:`, error)
        throw error
      }
    },
    [trackCommand, close]
  )

  return { executeCommand }
}
