import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useMemo } from 'react'
import type { Command, RouteCommand } from '../types'

/**
 * Command Palette Store State
 * 只存储原始状态，不存储computed state
 */
interface CommandPaletteState {
  // UI状态
  isOpen: boolean
  query: string
  activeCommand: string | null

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

/**
 * ✅ 计算式selectors - 使用稳定的引用
 */
export const useAllCommands = () => {
  const routeCommands = useCommandPaletteStore((state) => state.routeCommands)
  const pluginCommands = useCommandPaletteStore((state) => state.pluginCommands)

  // 只有当routeCommands或pluginCommands真正变化时才创建新数组
  return useMemo(() => {
    return [...routeCommands, ...pluginCommands]
  }, [routeCommands, pluginCommands])
}

export const useSearchResults = () => {
  const query = useCommandPaletteStore((state) => state.query)
  const allCommands = useAllCommands()

  // 实时计算搜索结果
  if (!query.trim()) return allCommands

  // 简单搜索实现，可以后续升级为Fuse.js
  const lowerQuery = query.toLowerCase()
  return allCommands.filter((command) => {
    const searchText = [
      command.title,
      command.subtitle || '',
      command.category || '',
      ...command.keywords
    ]
      .join(' ')
      .toLowerCase()

    return searchText.includes(lowerQuery)
  })
}

export const useSearchableCommands = () => {
  const allCommands = useAllCommands()

  // 实时计算可搜索命令
  return allCommands.filter(
    (command): command is Command =>
      'render' in command && 'canHandleQuery' in command && command.canHandleQuery !== undefined
  )
}

/**
 * ✅ 便捷的状态访问hooks
 */
export const useCommandPaletteOpen = () => useCommandPaletteStore((state) => state.isOpen)

export const useCommandPaletteQuery = () => useCommandPaletteStore((state) => state.query)

export const useCommandPaletteActiveCommand = () =>
  useCommandPaletteStore((state) => state.activeCommand)

export const useCommandPaletteActions = () => useCommandPaletteStore((state) => state.actions)
