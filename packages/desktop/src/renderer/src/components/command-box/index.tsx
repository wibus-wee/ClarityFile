/**
 * Command Box 组件入口
 * 全功能的命令面板，支持搜索、导航、快捷操作等
 */

export { CommandBox } from './command-box'
export { CommandBoxProvider } from './command-box-provider'
export { useCommandBox } from './stores/command-box-store'
export {
  useKeyboard,
  useSearchKeyboard,
  useCommandBoxKeyboard,
  useCommandBoxSearchKeyboard
} from './hooks/use-keyboard'

// 导出类型
export type {
  CommandItem,
  NavigationItem,
  ActionItem,
  SearchResultItem,
  RecentItem,
  SuggestionItem,
  SearchableItem,
  SearchOptions,
  SearchResult,
  CommandBoxState,
  CommandBoxActions,
  CommandBoxStore,
  KeyboardHandlerOptions,
  SearchEngineConfig,
  TrackingConfig
} from './types/command-box.types'
