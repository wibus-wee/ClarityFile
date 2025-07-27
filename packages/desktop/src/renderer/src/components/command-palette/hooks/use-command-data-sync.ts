import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useRouteCommands } from './use-route-commands'
import { usePluginCommands } from './use-plugin-commands'
import { useCommandPaletteActions } from '../stores/command-palette-store'

/**
 * Command Data Synchronization Hook
 *
 * Single responsibility: Keep the store synchronized with fresh command data
 * This hook should be used at the top level of the command palette component tree
 */
export function useCommandDataSync() {
  const router = useRouter()
  const { setRouteCommands, setPluginCommands } = useCommandPaletteActions()

  // Get fresh command data
  const routeCommands = useRouteCommands(router)
  const pluginCommands = usePluginCommands()

  // Sync route commands to store
  useEffect(() => {
    setRouteCommands(routeCommands)
  }, [routeCommands, setRouteCommands])

  // Sync plugin commands to store
  useEffect(() => {
    setPluginCommands(pluginCommands)
  }, [pluginCommands, setPluginCommands])

  return {
    routeCommands,
    pluginCommands
  }
}
