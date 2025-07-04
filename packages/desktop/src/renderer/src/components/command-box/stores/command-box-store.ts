import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CommandBoxStore,
  NavigationItem,
  ActionItem,
  RecentItem,
  SearchResult,
  SuggestionItem
} from '../types/command-box.types'

// 初始状态
const initialState = {
  // 显示状态
  isOpen: false,
  searchQuery: '',
  selectedIndex: 0,

  // 数据状态
  navigationItems: [] as NavigationItem[],
  actionItems: [] as ActionItem[],
  recentItems: [] as RecentItem[],
  searchResults: [] as SearchResult[],
  suggestions: [] as SuggestionItem[],

  // 用户行为
  searchHistory: [] as string[],
  usageStats: {} as Record<string, number>,

  // UI 状态
  isSearching: false,
  activeGroup: null as string | null
}

export const useCommandBoxStore = create<CommandBoxStore>()(
  persist(
    (set, get) =>
      ({
        ...initialState,

        // 基础操作
        open: () => {
          set({ isOpen: true, selectedIndex: 0 })
        },

        close: () => {
          set({
            isOpen: false,
            searchQuery: '',
            selectedIndex: 0,
            searchResults: [],
            activeGroup: null
          })
        },

        toggle: () => {
          const { isOpen } = get()
          if (isOpen) {
            get().close()
          } else {
            get().open()
          }
        },

        // 搜索操作
        setSearchQuery: (query: string) => {
          set({
            searchQuery: query,
            selectedIndex: 0,
            isSearching: query.length > 0
          })

          // 如果查询为空，清除搜索结果
          if (!query.trim()) {
            set({ searchResults: [], isSearching: false })
          }
        },

        clearSearch: () => {
          set({
            searchQuery: '',
            searchResults: [],
            selectedIndex: 0,
            isSearching: false
          })
        },

        // 导航操作
        setSelectedIndex: (index: number) => {
          set({ selectedIndex: Math.max(0, index) })
        },

        selectNext: () => {
          const { selectedIndex } = get()
          const totalItems = get().getTotalVisibleItems()
          set({ selectedIndex: (selectedIndex + 1) % totalItems })
        },

        selectPrevious: () => {
          const { selectedIndex } = get()
          const totalItems = get().getTotalVisibleItems()
          set({ selectedIndex: selectedIndex === 0 ? totalItems - 1 : selectedIndex - 1 })
        },

        selectItem: (index?: number) => {
          const { selectedIndex } = get()
          const targetIndex = index ?? selectedIndex
          const allItems = get().getAllVisibleItems()

          if (allItems[targetIndex]) {
            const item = allItems[targetIndex]

            // 更新使用统计
            get().updateUsageStats(item.id)

            // 执行操作
            item.action()

            // 关闭 Command Box
            get().close()
          }
        },

        // 数据操作
        addRecentItem: (item: RecentItem) => {
          const { recentItems } = get()

          // 检查是否已存在
          const existingIndex = recentItems.findIndex(
            (existing) => existing.id === item.id && existing.type === item.type
          )

          let newRecentItems: RecentItem[]

          if (existingIndex >= 0) {
            // 更新现有项目
            newRecentItems = [...recentItems]
            newRecentItems[existingIndex] = {
              ...newRecentItems[existingIndex],
              timestamp: item.timestamp,
              frequency: newRecentItems[existingIndex].frequency + 1
            }
          } else {
            // 添加新项目
            newRecentItems = [item, ...recentItems]
          }

          // 按时间和频率排序，保留最多 20 个
          newRecentItems = newRecentItems
            .sort((a, b) => {
              const aScore = a.timestamp * 0.6 + a.frequency * 0.4
              const bScore = b.timestamp * 0.6 + b.frequency * 0.4
              return bScore - aScore
            })
            .slice(0, 20)

          set({ recentItems: newRecentItems })
        },

        updateUsageStats: (itemId: string) => {
          const { usageStats } = get()
          set({
            usageStats: {
              ...usageStats,
              [itemId]: (usageStats[itemId] || 0) + 1
            }
          })
        },

        addToSearchHistory: (query: string) => {
          if (!query.trim()) return

          const { searchHistory } = get()
          const newHistory = [query, ...searchHistory.filter((h) => h !== query)].slice(0, 10)
          set({ searchHistory: newHistory })
        },

        // 重置操作
        reset: () => {
          set(initialState)
        },

        // 辅助方法
        getAllVisibleItems: () => {
          const {
            navigationItems,
            actionItems,
            searchResults,
            recentItems,
            suggestions,
            searchQuery
          } = get()

          if (searchQuery.trim()) {
            return searchResults
          }

          return [
            ...navigationItems,
            ...actionItems,
            ...recentItems.map((item) => ({
              ...item,
              type: 'recent' as const,
              action: () => {
                // 根据类型执行相应的导航操作
                console.log('Navigate to recent item:', item)
              }
            })),
            ...suggestions
          ]
        },

        getTotalVisibleItems: () => {
          return get().getAllVisibleItems().length
        },

        // 设置数据
        setNavigationItems: (items: NavigationItem[]) => {
          set({ navigationItems: items })
        },

        setActionItems: (items: ActionItem[]) => {
          set({ actionItems: items })
        },

        setSearchResults: (results: SearchResult[]) => {
          set({ searchResults: results, isSearching: false })
        },

        setSuggestions: (suggestions: SuggestionItem[]) => {
          set({ suggestions })
        }
      }) as CommandBoxStore,
    {
      name: 'command-box-storage',
      partialize: (state) => ({
        recentItems: state.recentItems,
        searchHistory: state.searchHistory,
        usageStats: state.usageStats
      })
    }
  )
)

// 导出类型化的 hook
export const useCommandBox = () => useCommandBoxStore()
