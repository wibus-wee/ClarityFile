/**
 * Command Palette 组件导出
 */

// 主要组件
export { CommandPaletteProvider } from './command-palette-provider'
export { CommandPaletteOverlay } from './command-palette-overlay'
export { CommandPaletteInput } from './command-palette-input'
export { CommandPaletteResults } from './command-palette-results'

// Store 和 Hooks
export {
  useCommandPaletteStore,
  useCommandPaletteOpen,
  useCommandPaletteQuery,
  useCommandPaletteActivePlugin,
  useCommandPaletteActions
} from './stores/command-palette-store'

// Context Hook
export { useCommandPaletteContext } from './command-palette-context'

// 数据管理 Hooks
export { useCommandPaletteData, useCommandPaletteFavorites } from './hooks/use-command-palette-data'
export { useCommandPalette } from './hooks/use-command-palette'

// 核心注册表
export { RouteRegistry } from './core/route-registry'
export { CommandRegistry } from './core/command-registry'

// 插件系统
export * from './plugins'

// 类型定义
export type {
  Command,
  RouteCommand,
  RecentCommand,
  PluginConfig,
  PluginContext,
  CommandPalettePlugin,
  CommandPaletteStore,
  CommandPaletteStoreState,
  CommandPaletteStoreActions,
  CommandPaletteProviderProps,
  CommandPaletteContextValue
} from './types'
