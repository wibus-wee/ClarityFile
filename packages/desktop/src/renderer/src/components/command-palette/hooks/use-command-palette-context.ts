import { useMemo } from 'react'
import { useRouter } from '@tanstack/react-router'
import {
  useCommandPaletteActions,
  useCommandPaletteQuery,
  useCommandPaletteActiveCommand
} from '../stores/command-palette-store'
import { PluginContext } from '../plugins/types'
import { createPluginContext } from '../plugins/utils'

/**
 * Command Palette Context Hook
 *
 * Single responsibility: Create and manage plugin context
 */
export function useCommandPaletteContext(): PluginContext {
  const router = useRouter()
  const { close, setQuery, goBackToRoot } = useCommandPaletteActions()
  const query = useCommandPaletteQuery()
  const activeCommand = useCommandPaletteActiveCommand()

  const pluginContext = useMemo((): PluginContext => {
    return createPluginContext(router, {
      close,
      setQuery,
      // 如果有激活命令，返回空查询；否则返回当前查询
      getQuery: () => (activeCommand ? '' : query),
      goBack: () => {
        goBackToRoot()
      }
    })
  }, [router, close, setQuery, query, activeCommand, goBackToRoot])

  return pluginContext
}
