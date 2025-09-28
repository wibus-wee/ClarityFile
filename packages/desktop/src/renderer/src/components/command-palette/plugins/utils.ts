import type { Router } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { PluginContext } from './types'
import type {
  PluginI18nAdapter,
  PluginI18nTranslateOptions,
  PluginLogger,
  PluginRuntimeServices
} from '../types'

function createConsoleLogger(prefix: string): PluginLogger {
  const formatMessage = (level: string, message: string) => `[${prefix}] [${level}] ${message}`

  return {
    debug: (message, meta) => console.debug(formatMessage('debug', message), meta ?? ''),
    info: (message, meta) => console.info(formatMessage('info', message), meta ?? ''),
    warn: (message, meta) => console.warn(formatMessage('warn', message), meta ?? ''),
    error: (message, meta) => console.error(formatMessage('error', message), meta ?? '')
  }
}

function createFallbackTranslator(namespace: string): PluginI18nAdapter {
  return {
    namespace,
    t: <T = string>(key: string, options?: PluginI18nTranslateOptions<T>) => {
      if (options?.defaultValue !== undefined) {
        return options.defaultValue
      }
      return (`${namespace}:${key}` as unknown) as T
    },
    hasKey: () => false
  }
}

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
  },
  runtime?: PluginRuntimeServices
): PluginContext {
  const effectiveRuntime: PluginRuntimeServices =
    runtime ?? {
      logger: createConsoleLogger('command-palette'),
      i18n: createFallbackTranslator('command-palette'),
      registerCleanup: () => {}
    }

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
    },
    runtime: effectiveRuntime,
    i18n: effectiveRuntime.i18n,
    logger: effectiveRuntime.logger
  }
}
