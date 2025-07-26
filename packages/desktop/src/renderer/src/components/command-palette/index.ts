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
export { useCommandPaletteContext } from './command-palette-provider'

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
