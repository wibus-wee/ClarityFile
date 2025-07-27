import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { CommandPalettePlugin } from '../types'

/**
 * 插件注册表状态接口
 */
interface PluginRegistryState {
  // 已注册的插件
  plugins: Map<string, CommandPalettePlugin>

  // 插件加载状态
  loadingPlugins: Set<string>

  // 插件错误状态
  pluginErrors: Map<string, Error>

  // 插件初始化状态
  isInitialized: boolean
}

/**
 * 插件注册表操作接口
 */
interface PluginRegistryActions {
  // 插件管理
  registerPlugin: (plugin: CommandPalettePlugin) => void
  unregisterPlugin: (pluginId: string) => void

  // 批量操作
  registerPlugins: (plugins: CommandPalettePlugin[]) => void
  clearAllPlugins: () => void

  // 状态管理
  setPluginLoading: (pluginId: string, loading: boolean) => void
  setPluginError: (pluginId: string, error: Error | null) => void

  // 查询方法
  getPlugin: (pluginId: string) => CommandPalettePlugin | undefined
  getAllPlugins: () => CommandPalettePlugin[]
  getEnabledPlugins: () => CommandPalettePlugin[]

  // 初始化
  initialize: () => void
}

/**
 * 插件注册表Store类型
 */
type PluginRegistryStore = PluginRegistryState & {
  actions: PluginRegistryActions
}

/**
 * 初始状态
 */
const initialState: PluginRegistryState = {
  plugins: new Map(),
  loadingPlugins: new Set(),
  pluginErrors: new Map(),
  isInitialized: false
}

/**
 * 插件注册表Store
 */
export const usePluginRegistryStore = create<PluginRegistryStore>()(
  immer((set, get) => ({
    ...initialState,

    actions: {
      /**
       * 注册单个插件
       */
      registerPlugin: (plugin) => {
        set((state) => {
          state.plugins.set(plugin.id, plugin)
          state.loadingPlugins.delete(plugin.id)
          state.pluginErrors.delete(plugin.id)
        })
        console.log(`Plugin registered: ${plugin.id}`)
      },

      /**
       * 注销插件
       */
      unregisterPlugin: (pluginId) => {
        set((state) => {
          state.plugins.delete(pluginId)
          state.loadingPlugins.delete(pluginId)
          state.pluginErrors.delete(pluginId)
        })
        console.log(`Plugin unregistered: ${pluginId}`)
      },

      /**
       * 批量注册插件
       */
      registerPlugins: (plugins) => {
        set((state) => {
          plugins.forEach((plugin) => {
            state.plugins.set(plugin.id, plugin)
            state.loadingPlugins.delete(plugin.id)
            state.pluginErrors.delete(plugin.id)
          })
        })
        console.log(`Batch registered ${plugins.length} plugins`)
      },

      /**
       * 清空所有插件
       */
      clearAllPlugins: () => {
        set((state) => {
          state.plugins.clear()
          state.loadingPlugins.clear()
          state.pluginErrors.clear()
        })
        console.log('All plugins cleared')
      },

      /**
       * 设置插件加载状态
       */
      setPluginLoading: (pluginId, loading) => {
        set((state) => {
          if (loading) {
            state.loadingPlugins.add(pluginId)
          } else {
            state.loadingPlugins.delete(pluginId)
          }
        })
      },

      /**
       * 设置插件错误状态
       */
      setPluginError: (pluginId, error) => {
        set((state) => {
          if (error) {
            state.pluginErrors.set(pluginId, error)
          } else {
            state.pluginErrors.delete(pluginId)
          }
          state.loadingPlugins.delete(pluginId)
        })
      },

      /**
       * 获取单个插件
       */
      getPlugin: (pluginId) => {
        return get().plugins.get(pluginId)
      },

      /**
       * 获取所有插件
       */
      getAllPlugins: () => {
        return Array.from(get().plugins.values())
      },

      /**
       * 获取启用的插件（暂时返回所有插件，后续可以集成配置系统）
       */
      getEnabledPlugins: () => {
        return Array.from(get().plugins.values())
      },

      /**
       * 初始化插件注册表
       */
      initialize: () => {
        set((state) => {
          state.isInitialized = true
        })
        console.log('Plugin registry initialized')
      }
    }
  }))
)

// 便捷的selector hooks
export const usePluginRegistryActions = () => usePluginRegistryStore((state) => state.actions)

export const useRegisteredPlugins = () =>
  usePluginRegistryStore((state) => state.actions.getAllPlugins())

export const useEnabledPlugins = () =>
  usePluginRegistryStore((state) => state.actions.getEnabledPlugins())

export const usePluginRegistryInitialized = () =>
  usePluginRegistryStore((state) => state.isInitialized)
