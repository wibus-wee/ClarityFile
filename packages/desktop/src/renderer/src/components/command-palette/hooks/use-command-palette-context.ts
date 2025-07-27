import { useMemo } from 'react'
import { useRouter } from '@tanstack/react-router'
import { createPluginContext } from '../plugins/plugin-context'
import { useCommandPaletteActions, useCommandPaletteQuery } from '../stores/command-palette-store'
import type { PluginContext } from '../types'

/**
 * Command Palette Context Hook
 *
 * Single responsibility: Create and manage plugin context
 */
export function useCommandPaletteContext(): PluginContext {
  const router = useRouter()
  const { close, setQuery } = useCommandPaletteActions()
  const query = useCommandPaletteQuery()

  const pluginContext = useMemo((): PluginContext => {
    return createPluginContext(
      router,
      {
        close,
        setQuery,
        getQuery: () => query,
        goBack: () => {
          // Implement back navigation logic
          console.log('Go back')
        }
      },
      {
        // Inject service implementations
        files: undefined,
        themes: undefined,
        settings: undefined
      },
      {
        language: 'zh-CN',
        theme: 'system',
        shortcuts: {}
      }
    )
  }, [router, close, setQuery, query])

  return pluginContext
}
