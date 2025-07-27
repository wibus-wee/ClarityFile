import React from 'react'
import type { PluginContext } from '../plugins/plugin-context'
export type { PluginContext }

/**
 * 基础命令接口 - 包含所有命令的公共字段
 */
interface BaseCommand {
  id: string
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  keywords: string[]
  category?: string
  source: 'core' | 'plugin'
  pluginId?: string
}

/**
 * 带渲染功能的命令 - 与action互斥
 */
export type CommandWithRender = BaseCommand & {
  render: (context: PluginContext) => React.ReactNode
  canHandleQuery?: (query: string) => boolean // 是否可以处理搜索查询
  action?: never // 当有render时不能有action
}

/**
 * 带操作功能的命令 - 与render互斥
 */
export type CommandWithAction = BaseCommand & {
  action: () => void | Promise<void>
  render?: never // 当有action时不能有render
  canHandleQuery?: never // action命令不处理查询
}

/**
 * 命令联合类型 - 确保render和action互斥
 */
export type Command = CommandWithRender | CommandWithAction

/**
 * 路由命令接口（基于BaseCommand + action）
 */
export interface RouteCommand extends BaseCommand {
  path: string
  pinyin: string[]
  source: 'core'
  action: () => void | Promise<void>
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
  order: number
}

/**
 * Command Palette 插件接口 - 简化为只发布命令
 */
export interface CommandPalettePlugin {
  id: string
  name: string
  description: string

  // 插件只发布命令，不再有自己的render/execute
  publishCommands: () => Command[]
}

/**
 * Command Palette Store 状态接口 (已废弃，使用新的store)
 * @deprecated 使用新的store实现
 */
export interface CommandPaletteStoreState {
  // UI 状态
  isOpen: boolean
  query: string
  activeCommand: string | null

  // 本地状态（不需要持久化）
  pluginStates: Record<string, any>

  // 原始数据（不再存储computed state）
  routeCommands: RouteCommand[]
  pluginCommands: Command[]
}

/**
 * Command Palette Store 操作接口 (已废弃，使用新的store)
 * @deprecated 使用新的store实现
 */
export interface CommandPaletteStoreActions {
  // UI Actions
  open: () => void
  close: () => void
  setQuery: (query: string) => void
  setActiveCommand: (commandId: string | null) => void

  // 插件状态管理
  setPluginState: (pluginId: string, state: any) => void
  getPluginState: (pluginId: string) => any

  // 数据更新Actions (纯粹的状态更新，无副作用)
  setRouteCommands: (routeCommands: RouteCommand[]) => void
  setPluginCommands: (pluginCommands: Command[]) => void
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
  // 插件配置
  pluginConfigs: Record<string, PluginConfig>
  updatePluginConfig: (pluginId: string, config: PluginConfig) => Promise<any>

  // 加载状态
  isLoading: boolean
}
