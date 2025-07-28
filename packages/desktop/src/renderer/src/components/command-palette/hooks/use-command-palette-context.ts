import { useMemo } from 'react'
import { useRouter } from '@tanstack/react-router'
import { createPluginContext } from '../plugins/plugin-context'
import {
  useCommandPaletteActions,
  useCommandPaletteQuery,
  useCommandPaletteActiveCommand
} from '../stores/command-palette-store'
import type { PluginContext } from '../types'

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
    return createPluginContext(
      router,
      {
        close,
        setQuery,
        // 如果有激活命令，返回空查询；否则返回当前查询
        getQuery: () => (activeCommand ? '' : query),
        goBack: () => {
          goBackToRoot()
        }
      },
      {
        language: 'zh-CN',
        theme: 'system',
        shortcuts: {}
      }
    )
  }, [router, close, setQuery, query, activeCommand, goBackToRoot])

  return pluginContext
}
