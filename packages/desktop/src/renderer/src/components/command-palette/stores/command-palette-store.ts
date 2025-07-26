import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { CommandPaletteStore, CommandPaletteStoreState } from '../types'

/**
 * 初始状态
 */
const initialState: CommandPaletteStoreState = {
  isOpen: false,
  query: '',
  activePlugin: null,
  pluginStates: {}
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
          state.activePlugin = null
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
      },

      /**
       * 设置当前激活的插件
       */
      setActivePlugin: (pluginId: string | null) => {
        set((state) => {
          state.activePlugin = pluginId
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
      }
    }
  }))
)

/**
 * 便捷的 hooks 用于访问特定状态
 */
export const useCommandPaletteOpen = () => useCommandPaletteStore((state) => state.isOpen)

export const useCommandPaletteQuery = () => useCommandPaletteStore((state) => state.query)

export const useCommandPaletteActivePlugin = () =>
  useCommandPaletteStore((state) => state.activePlugin)

export const useCommandPaletteActions = () => useCommandPaletteStore((state) => state.actions)
