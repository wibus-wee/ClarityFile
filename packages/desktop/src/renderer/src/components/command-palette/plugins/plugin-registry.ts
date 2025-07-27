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
  pluginErrors: Map<string, string>

  // 注册表是否已初始化
  isInitialized: boolean
}

/**
 * 插件注册表操作接口
 */
interface PluginRegistryActions {
  // 注册插件
  registerPlugin: (plugin: CommandPalettePlugin) => void

  // 注销插件
  unregisterPlugin: (pluginId: string) => void

  // 批量注册插件
  registerPlugins: (plugins: CommandPalettePlugin[]) => void

  // 获取插件
  getPlugin: (pluginId: string) => CommandPalettePlugin | undefined

  // 获取所有插件
  getAllPlugins: () => CommandPalettePlugin[]

  // 获取启用的插件
  getEnabledPlugins: (configs: Record<string, { enabled: boolean }>) => CommandPalettePlugin[]

  // 设置插件加载状态
  setPluginLoading: (pluginId: string, loading: boolean) => void

  // 设置插件错误
  setPluginError: (pluginId: string, error: string | null) => void

  // 清除所有插件
  clearPlugins: () => void

  // 初始化注册表
  initialize: () => void
}

type PluginRegistryStore = PluginRegistryState & {
  actions: PluginRegistryActions
}

/**
 * 插件注册表 Zustand Store
 *
 * 设计原则：
 * 1. 使用 Map 存储插件以提高查找性能
 * 2. 支持插件的动态注册和注销
 * 3. 提供插件状态管理（加载中、错误等）
 * 4. 与插件配置系统解耦
 */
export const usePluginRegistryStore = create<PluginRegistryStore>()(
  immer((set, get) => ({
    // 初始状态
    plugins: new Map(),
    loadingPlugins: new Set(),
    pluginErrors: new Map(),
    isInitialized: false,

    actions: {
      // 注册单个插件
      registerPlugin: (plugin: CommandPalettePlugin) =>
        set((state) => {
          if (state.plugins.has(plugin.id)) {
            console.warn(`Plugin ${plugin.id} is already registered, replacing...`)
          }

          state.plugins.set(plugin.id, plugin)
          state.pluginErrors.delete(plugin.id)
          state.loadingPlugins.delete(plugin.id)

          console.log(`Plugin registered: ${plugin.id} - ${plugin.name}`)
        }),

      // 注销插件
      unregisterPlugin: (pluginId: string) =>
        set((state) => {
          if (state.plugins.has(pluginId)) {
            state.plugins.delete(pluginId)
            state.pluginErrors.delete(pluginId)
            state.loadingPlugins.delete(pluginId)
            console.log(`Plugin unregistered: ${pluginId}`)
          } else {
            console.warn(`Plugin ${pluginId} is not registered`)
          }
        }),

      // 批量注册插件
      registerPlugins: (plugins: CommandPalettePlugin[]) =>
        set((state) => {
          plugins.forEach((plugin) => {
            if (state.plugins.has(plugin.id)) {
              console.warn(`Plugin ${plugin.id} is already registered, replacing...`)
            }

            state.plugins.set(plugin.id, plugin)
            state.pluginErrors.delete(plugin.id)
            state.loadingPlugins.delete(plugin.id)
          })

          console.log(
            `Batch registered ${plugins.length} plugins:`,
            plugins.map((p) => p.id)
          )
        }),

      // 获取单个插件
      getPlugin: (pluginId: string) => {
        return get().plugins.get(pluginId)
      },

      // 获取所有插件
      getAllPlugins: () => {
        return Array.from(get().plugins.values())
      },

      // 获取启用的插件
      getEnabledPlugins: (configs: Record<string, { enabled: boolean }>) => {
        const allPlugins = Array.from(get().plugins.values())
        return allPlugins.filter((plugin) => {
          const config = configs[plugin.id]
          return config?.enabled !== false // 默认启用
        })
      },

      // 设置插件加载状态
      setPluginLoading: (pluginId: string, loading: boolean) =>
        set((state) => {
          if (loading) {
            state.loadingPlugins.add(pluginId)
          } else {
            state.loadingPlugins.delete(pluginId)
          }
        }),

      // 设置插件错误
      setPluginError: (pluginId: string, error: string | null) =>
        set((state) => {
          if (error) {
            state.pluginErrors.set(pluginId, error)
            state.loadingPlugins.delete(pluginId)
          } else {
            state.pluginErrors.delete(pluginId)
          }
        }),

      // 清除所有插件
      clearPlugins: () =>
        set((state) => {
          state.plugins.clear()
          state.loadingPlugins.clear()
          state.pluginErrors.clear()
          console.log('All plugins cleared')
        }),

      // 初始化注册表
      initialize: () =>
        set((state) => {
          state.isInitialized = true
          console.log('Plugin registry initialized')
        })
    }
  }))
)

/**
 * 便捷的访问hooks
 */
export const usePluginRegistry = () => usePluginRegistryStore((state) => state.actions)

export const useRegisteredPlugins = () => {
  // ✅ 直接返回插件数组，让调用方处理 memoization
  return usePluginRegistryStore((state) => Array.from(state.plugins.values()))
}

// ✅ 分别获取各个状态，避免创建新对象
export const usePluginRegistryIsInitialized = () =>
  usePluginRegistryStore((state) => state.isInitialized)

export const usePluginRegistryPluginCount = () =>
  usePluginRegistryStore((state) => state.plugins.size)

export const usePluginRegistryErrorCount = () =>
  usePluginRegistryStore((state) => state.pluginErrors.size)

export const usePluginRegistryErrors = () =>
  usePluginRegistryStore((state) => Array.from(state.pluginErrors.entries()))

/**
 * 获取特定插件的状态
 */
export const usePluginState = (pluginId: string) =>
  usePluginRegistryStore((state) => ({
    plugin: state.plugins.get(pluginId),
    isLoading: state.loadingPlugins.has(pluginId),
    error: state.pluginErrors.get(pluginId),
    isRegistered: state.plugins.has(pluginId)
  }))
