import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useMemo } from 'react'
import type { Command, RouteCommand } from '../types'
import { enhancedFuzzySearch } from '../utils/search'
import { useCommandFavorites } from '../hooks/use-command-favorites'
import { useFavoritesData } from '../hooks/use-command-palette-data'

/**
 * Command Palette Store State
 * 只存储原始状态，不存储computed state
 */
interface CommandPaletteState {
  // UI状态
  isOpen: boolean
  query: string
  activeCommand: string | null
  // 保存进入命令详情前的查询，用于返回时恢复（仅从搜索结果进入时使用）
  savedQuery: string | null

  // 原始数据（由外部提供）
  routeCommands: RouteCommand[]
  pluginCommands: Command[]

  // 插件状态
  pluginStates: Record<string, any>
}

interface CommandPaletteActions {
  // UI Actions（纯粹的状态更新）
  open: () => void
  close: () => void
  setQuery: (query: string) => void
  setActiveCommand: (commandId: string | null) => void
  // 从搜索结果进入命令详情（清空查询但保存原查询）
  setActiveCommandFromSearch: (commandId: string) => void
  // 返回到根视图（恢复保存的查询）
  goBackToRoot: () => void

  // 数据更新（纯粹的状态更新，无副作用）
  setRouteCommands: (commands: RouteCommand[]) => void
  setPluginCommands: (commands: Command[]) => void

  // 插件状态管理
  setPluginState: (pluginId: string, state: any) => void
  getPluginState: (pluginId: string) => any
}

type CommandPaletteStore = CommandPaletteState & {
  actions: CommandPaletteActions
}

/**
 * Command Palette Zustand Store
 *
 * 设计原则：
 * 1. 只存储原始状态，不存储computed state
 * 2. 使用selectors计算派生状态
 * 3. 避免action中调用其他actions
 * 4. 保持数据流单向性
 */
export const useCommandPaletteStore = create<CommandPaletteStore>()(
  immer((set, get) => ({
    // 初始状态
    isOpen: false,
    query: '',
    activeCommand: null,
    savedQuery: null,
    routeCommands: [],
    pluginCommands: [],
    pluginStates: {},

    actions: {
      // ✅ 纯粹的UI状态更新
      open: () =>
        set((state) => {
          state.isOpen = true
        }),

      close: () =>
        set((state) => {
          state.isOpen = false
          state.activeCommand = null
          state.query = ''
          state.savedQuery = null
        }),

      // ✅ 不触发副作用，让组件自己处理搜索
      setQuery: (query: string) =>
        set((state) => {
          state.query = query
        }),

      setActiveCommand: (commandId: string | null) =>
        set((state) => {
          state.activeCommand = commandId
        }),

      // 从搜索结果进入命令详情（清空查询但保存原查询）
      setActiveCommandFromSearch: (commandId: string) =>
        set((state) => {
          state.savedQuery = state.query // 保存当前查询
          state.query = '' // 清空查询
          state.activeCommand = commandId
        }),

      // 返回到根视图（仅在从搜索结果进入时恢复保存的查询）
      goBackToRoot: () =>
        set((state) => {
          state.activeCommand = null
          if (state.savedQuery !== null) {
            state.query = state.savedQuery // 恢复保存的查询
            state.savedQuery = null
          }
          // 如果没有 savedQuery，说明是从 "Use with..." 进入的，保持当前查询不变
        }),

      // ✅ 纯粹的数据更新，无副作用
      setRouteCommands: (commands: RouteCommand[]) =>
        set((state) => {
          state.routeCommands = commands
        }),

      setPluginCommands: (commands: Command[]) =>
        set((state) => {
          state.pluginCommands = commands
        }),

      // 插件状态管理
      setPluginState: (pluginId: string, pluginState: any) =>
        set((state) => {
          state.pluginStates[pluginId] = pluginState
        }),

      getPluginState: (pluginId: string) => get().pluginStates[pluginId]
    }
  }))
)

export const useCommandPaletteQuery = () => useCommandPaletteStore((state) => state.query)
export const useRouteCommandsData = () => useCommandPaletteStore((state) => state.routeCommands)
export const usePluginCommandsData = () => useCommandPaletteStore((state) => state.pluginCommands)

// 组合选择器：计算所有命令
export const useAllCommands = () => {
  const routeCommands = useRouteCommandsData()
  const pluginCommands = usePluginCommandsData()
  // 使用 useMemo 确保只有在源数据变化时才创建新数组
  return useMemo(() => [...routeCommands, ...pluginCommands], [routeCommands, pluginCommands])
}

// 派生选择器：计算搜索结果
// 这个 Hook 将替换掉你的 useCommandSearch
export const useSearchResults = () => {
  const allCommands = useAllCommands()
  const query = useCommandPaletteQuery()
  const { recentCommands } = useFavoritesData()

  return useMemo(() => {
    if (!query.trim()) {
      // 当没有查询时，返回所有命令，让 UI 决定如何显示默认视图
      return allCommands
    }
    // 使用增强的模糊搜索，结合文本匹配和使用频率
    return enhancedFuzzySearch(allCommands, query, recentCommands)
  }, [allCommands, query, recentCommands])
}

// 派生选择器: 为 UI 提供最终的、可直接渲染的数据 (这是最重要的 Hook)
export const useEnhancedResults = () => {
  const searchResults = useSearchResults()
  const { isFavorite } = useCommandFavorites() // 直接在这里组合收藏逻辑
  const query = useCommandPaletteQuery()

  return useMemo(() => {
    const enhanced = searchResults.map((cmd) => ({
      ...cmd,
      isFavorite: isFavorite(cmd.id)
    }))

    const routes = enhanced.filter((cmd) => cmd.source === 'core')
    const plugins = enhanced.filter((cmd) => cmd.source === 'plugin')

    return {
      results: enhanced, // 扁平、增强的列表
      categorizedResults: { routes, plugins }, // 分类后的结果
      totalResults: enhanced.length,
      hasQuery: query.trim().length > 0,
      query: query
    }
  }, [searchResults, isFavorite, query])
}

export const useCommandPaletteActions = () => useCommandPaletteStore((state) => state.actions)
export const useSearchableCommands = () => {
  const allCommands = useAllCommands()

  return useMemo(() => {
    return allCommands.filter(
      (command): command is Command =>
        'render' in command && 'canHandleQuery' in command && command.canHandleQuery !== undefined
    )
  }, [allCommands])
}
export const useCommandPaletteOpen = () => useCommandPaletteStore((state) => state.isOpen)
export const useCommandPaletteActiveCommand = () =>
  useCommandPaletteStore((state) => state.activeCommand)
