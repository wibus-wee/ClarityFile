import { createContext, useContext } from 'react'
import type { Router } from '@tanstack/react-router'
import { toast } from 'sonner'

/**
 * 插件上下文接口
 * 为插件提供访问应用功能的接口
 */
export interface PluginContext {
  // 路由导航
  router: Router<any, any>

  // 命令面板控制
  commandPalette: {
    close: () => void
    setQuery: (query: string) => void
    getQuery: () => string
    goBack: () => void
  }

  // 工具函数
  utils: {
    // 通知
    notify: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void

    // 确认对话框
    confirm: (message: string) => Promise<boolean>

    // 复制到剪贴板
    copyToClipboard: (text: string) => Promise<void>

    // 打开外部链接
    openExternal: (url: string) => Promise<void>
  }
}

/**
 * 插件上下文 Context
 */
export const PluginContextProvider = createContext<PluginContext | null>(null)

/**
 * 使用插件上下文的 Hook
 */
export function usePluginContext(): PluginContext {
  const context = useContext(PluginContextProvider)
  if (!context) {
    throw new Error('usePluginContext must be used within a PluginContextProvider')
  }
  return context
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
        // 这里可以使用 Electron 的 shell.openExternal
      }
    }
  }
}

/**
 * 插件上下文提供者组件的 Props
 */
export interface PluginContextProviderProps {
  children: React.ReactNode
  context: PluginContext
}

/**
 * 插件上下文提供者组件
 */
export function PluginContextProviderComponent({ children, context }: PluginContextProviderProps) {
  return <PluginContextProvider.Provider value={context}>{children}</PluginContextProvider.Provider>
}
