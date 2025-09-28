import type { Router } from '@tanstack/react-router'
import type { PluginI18nAdapter, PluginLogger, PluginRuntimeServices } from '../types'

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

  // 运行时服务
  runtime: PluginRuntimeServices

  // 便捷访问翻译
  i18n: PluginI18nAdapter

  // 便捷访问日志
  logger: PluginLogger
}

/**
 * 插件上下文提供者组件的 Props
 */
export interface PluginContextProviderProps {
  children: React.ReactNode
  context: PluginContext
}
