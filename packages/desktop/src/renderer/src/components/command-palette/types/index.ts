import React from 'react'

/**
 * 基础命令接口
 */
export interface Command {
  id: string
  title: string
  subtitle?: string
  icon?: React.ComponentType
  keywords: string[]
  category?: string
  action: () => void | Promise<void>
  source: 'core' | 'plugin'
  pluginId?: string
}

/**
 * 路由命令接口（继承自基础命令）
 */
export interface RouteCommand extends Command {
  path: string
  pinyin: string[]
  source: 'core'
}

/**
 * 最近使用的命令
 */
export interface RecentCommand {
  commandId: string
  timestamp: number
  frequency: number
}

/**
 * 插件配置接口
 */
export interface PluginConfig {
  id: string
  enabled: boolean
  searchable: boolean
  order: number
}

/**
 * 插件上下文接口
 */
export interface PluginContext {
  query: string
  router: any // 将来会使用正确的Router类型
  close: () => void
  setQuery: (query: string) => void
  services: {
    // 这里将来会添加各种服务的引用
    [key: string]: any
  }
}

/**
 * Command Palette 插件接口
 */
export interface CommandPalettePlugin {
  id: string
  name: string
  description: string
  keywords: string[]
  icon?: React.ComponentType
  canHandleQuery?: (query: string) => boolean
  execute?: (context: PluginContext) => void | Promise<void>
  render?: (context: PluginContext) => React.ReactNode
  searchable?: boolean
  publishCommands?: () => Command[]
}

/**
 * Command Palette Store 状态接口
 */
export interface CommandPaletteStoreState {
  // UI 状态
  isOpen: boolean
  query: string
  activePlugin: string | null

  // 本地状态（不需要持久化）
  pluginStates: Record<string, any>
}

/**
 * Command Palette Store 操作接口
 */
export interface CommandPaletteStoreActions {
  open: () => void
  close: () => void
  setQuery: (query: string) => void
  setActivePlugin: (pluginId: string | null) => void

  // 插件状态管理
  setPluginState: (pluginId: string, state: any) => void
  getPluginState: (pluginId: string) => any
}

/**
 * 完整的 Command Palette Store 接口
 */
export type CommandPaletteStore = CommandPaletteStoreState & {
  actions: CommandPaletteStoreActions
}

/**
 * Command Palette Provider 的 Props
 */
export interface CommandPaletteProviderProps {
  children: React.ReactNode
}

/**
 * Command Palette Context 接口
 */
export interface CommandPaletteContextValue {
  // 这里将来会添加 commandRegistry, routeRegistry 等
  [key: string]: any
}
