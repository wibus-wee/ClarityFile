import type { Router } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { PluginContext } from './types'

/**
 * 创建插件上下文的工厂函数
 */
export function createPluginContext(
  router: Router<any, any>,
  commandPaletteActions: {
    close: () => void
    setQuery: (query: string) => void
    getQuery: () => string
    goBack: () => void
  }
): PluginContext {
  return {
    router,
    commandPalette: commandPaletteActions,
    utils: {
      notify: (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        toast[type](message)
      },

      confirm: async (message: string): Promise<boolean> => {
        // 这里可以集成现有的确认对话框
        return window.confirm(message)
      },

      copyToClipboard: async (text: string): Promise<void> => {
        try {
          await navigator.clipboard.writeText(text)
        } catch (error) {
          console.error('Failed to copy to clipboard:', error)
          throw error
        }
      },

      openExternal: async (url: string): Promise<void> => {
        window.open(url)
      }
    }
  }
}
