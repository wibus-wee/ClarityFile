import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { CommandPaletteStore, CommandPaletteStoreState } from '../types'
import { searchAllCommands } from '../utils/search'
import { getSearchableCommands } from '../utils/plugin-commands'

/**
 * 初始状态
 */
const initialState: CommandPaletteStoreState = {
  isOpen: false,
  query: '',
  activeCommand: null, // 改为activeCommand
  pluginStates: {},

  // Computed State (初始为空)
  routeCommands: [],
  pluginCommands: [],
  searchResults: [],
  searchableCommands: []
}

/**
 * Command Palette Zustand Store
 *
 * 只管理UI状态，数据管理通过SWR hooks处理
 */
export const useCommandPaletteStore = create<CommandPaletteStore>()(
  immer((set, get) => ({
    ...initialState,

    actions: {
      /**
       * 打开 Command Palette
       */
      open: () => {
        set((state) => {
          state.isOpen = true
        })
      },

      /**
       * 关闭 Command Palette 并重置状态
       */
      close: () => {
        set((state) => {
          state.isOpen = false
          state.activeCommand = null // 改为activeCommand
          state.query = ''
        })
      },

      /**
       * 设置搜索查询
       */
      setQuery: (query: string) => {
        set((state) => {
          state.query = query
        })
        // 触发搜索结果更新
        get().actions.updateSearchResults()
      },

      /**
       * 设置当前激活的命令
       */
      setActiveCommand: (commandId: string | null) => {
        set((state) => {
          state.activeCommand = commandId // 改为activeCommand
        })
      },

      /**
       * 设置插件状态
       */
      setPluginState: (pluginId: string, pluginState: any) => {
        set((state) => {
          state.pluginStates[pluginId] = pluginState
        })
      },

      /**
       * 获取插件状态
       */
      getPluginState: (pluginId: string) => {
        return get().pluginStates[pluginId]
      },

      // 数据更新Actions (由hooks调用)

      /**
       * 更新路由命令
       */
      updateRouteCommands: (routeCommands) => {
        set((state) => {
          state.routeCommands = routeCommands
        })
        // 触发搜索结果更新
        get().actions.updateSearchResults()
      },

      /**
       * 更新插件命令
       */
      updatePluginCommands: (pluginCommands) => {
        set((state) => {
          state.pluginCommands = pluginCommands
        })
        // 触发搜索结果和可搜索命令更新
        get().actions.updateSearchResults()
        get().actions.updateSearchableCommands()
      },

      /**
       * 更新搜索结果
       */
      updateSearchResults: () => {
        const { query, routeCommands, pluginCommands } = get()
        const allCommands = [...routeCommands, ...pluginCommands]

        // 如果没有查询，显示所有命令；有查询时才进行搜索
        const searchResults = query.trim() ? searchAllCommands(allCommands, query) : allCommands

        set((state) => {
          state.searchResults = searchResults
        })
      },

      /**
       * 更新可搜索命令
       */
      updateSearchableCommands: () => {
        const { routeCommands, pluginCommands } = get()
        const allCommands = [...routeCommands, ...pluginCommands]
        const searchableCommands = getSearchableCommands(allCommands)

        set((state) => {
          state.searchableCommands = searchableCommands
        })
      }
    }
  }))
)

/**
 * 便捷的 hooks 用于访问特定状态
 */
export const useCommandPaletteOpen = () => useCommandPaletteStore((state) => state.isOpen)

export const useCommandPaletteQuery = () => useCommandPaletteStore((state) => state.query)

export const useCommandPaletteActiveCommand = () =>
  useCommandPaletteStore((state) => state.activeCommand)

export const useCommandPaletteActions = () => useCommandPaletteStore((state) => state.actions)
