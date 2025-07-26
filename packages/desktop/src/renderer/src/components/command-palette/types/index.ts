import React from 'react'
import { CommandRegistry } from '../core/command-registry'
import { RouteRegistry } from '../core/route-registry'
import type { PluginContext } from '../plugins/plugin-context'
export type { PluginContext }

/**
 * 基础命令接口
 */
export interface Command {
  id: string
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
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
 * Command Palette 插件接口
 */
export interface CommandPalettePlugin {
  id: string
  name: string
  description: string
  keywords: string[]
  icon?: React.ComponentType<{ className?: string }>
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
  // 注册表
  commandRegistry?: CommandRegistry
  routeRegistry?: RouteRegistry

  // 插件配置
  pluginConfigs: Record<string, PluginConfig>
  updatePluginConfig: (pluginId: string, config: PluginConfig) => Promise<any>

  // 加载状态
  isLoading: boolean
}
