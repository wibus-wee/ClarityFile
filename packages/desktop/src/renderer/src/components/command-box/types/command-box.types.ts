import { LucideIcon } from 'lucide-react'

/**
 * Command Box 相关类型定义
 */

// 基础项目类型
export type CommandItemType = 'navigation' | 'action' | 'search-result' | 'recent' | 'suggestion'

// 搜索结果类型
export type SearchResultType = 'project' | 'document' | 'file' | 'expense' | 'competition'

// 命令项目接口
export interface CommandItem {
  id: string
  type: CommandItemType
  title: string
  description?: string
  icon?: LucideIcon
  shortcut?: string
  keywords?: string[]
  category?: string
  action: () => void | Promise<void>
  disabled?: boolean
}

// 导航项目
export interface NavigationItem extends CommandItem {
  type: 'navigation'
  path: string
  params?: Record<string, string>
}

// 操作项目
export interface ActionItem extends CommandItem {
  type: 'action'
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

// 搜索结果项目
export interface SearchResultItem extends CommandItem {
  type: 'search-result'
  resultType: SearchResultType
  score?: number
  matches?: Array<{
    key: string
    value: string
    indices: [number, number][]
  }>
  metadata?: Record<string, any>
}

// 最近访问项目
export interface RecentItem {
  id: string
  type: SearchResultType
  title: string
  description?: string
  path: string
  icon?: LucideIcon
  timestamp: number
  frequency: number
  metadata?: Record<string, any>
}

// 智能建议项目
export interface SuggestionItem extends CommandItem {
  type: 'suggestion'
  confidence: number
  reason: string
}

// 搜索引擎接口
export interface SearchableItem {
  id: string
  type: SearchResultType
  title: string
  description?: string
  content?: string
  tags?: string[]
  keywords?: string[]
  path?: string
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

// 搜索选项
export interface SearchOptions {
  types?: SearchResultType[]
  limit?: number
  includeContent?: boolean
  fuzzyThreshold?: number
}

// 搜索结果
export interface SearchResult extends SearchableItem {
  score?: number
  matches?: Array<{
    key: string
    value: string
    indices: [number, number][]
  }>
}

// Command Box 状态
export interface CommandBoxState {
  // 显示状态
  isOpen: boolean
  searchQuery: string
  selectedIndex: number

  // 数据状态
  navigationItems: NavigationItem[]
  actionItems: ActionItem[]
  recentItems: RecentItem[]
  searchResults: SearchResult[]
  suggestions: SuggestionItem[]

  // 用户行为
  searchHistory: string[]
  usageStats: Record<string, number>

  // UI 状态
  isSearching: boolean
  activeGroup: string | null
}

// Command Box 操作
export interface CommandBoxActions {
  // 基础操作
  open: () => void
  close: () => void
  toggle: () => void

  // 搜索操作
  setSearchQuery: (query: string) => void
  clearSearch: () => void

  // 导航操作
  setSelectedIndex: (index: number) => void
  selectNext: () => void
  selectPrevious: () => void
  selectItem: (index?: number) => void

  // 数据操作
  addRecentItem: (item: RecentItem) => void
  updateUsageStats: (itemId: string) => void
  addToSearchHistory: (query: string) => void

  // 设置数据方法
  setNavigationItems: (items: NavigationItem[]) => void
  setActionItems: (items: ActionItem[]) => void
  setSearchResults: (results: SearchResult[]) => void
  setSuggestions: (suggestions: SuggestionItem[]) => void

  // 辅助方法
  getAllVisibleItems: () => CommandItem[]
  getTotalVisibleItems: () => number

  // 重置操作
  reset: () => void
}

// 完整的 Store 类型
export type CommandBoxStore = CommandBoxState & CommandBoxActions

// 键盘事件处理器选项
export interface KeyboardHandlerOptions {
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  totalItems: number
  onSelect: (index?: number) => void
  onClose: () => void
  onEscape?: () => void
}

// 搜索引擎配置
export interface SearchEngineConfig {
  threshold: number
  keys: string[]
  includeScore: boolean
  includeMatches: boolean
  minMatchCharLength: number
  maxResults: number
}

// 用户行为追踪配置
export interface TrackingConfig {
  maxRecentItems: number
  maxSearchHistory: number
  persistToStorage: boolean
  storageKey: string
}
