import { useEffect } from 'react'
import {
  usePluginRegistryStore,
  usePluginRegistryActions,
  useRegisteredPlugins,
  useEnabledPlugins,
  usePluginRegistryInitialized
} from '../stores/plugin-registry-store'
import type { CommandPalettePlugin } from '../types'

/**
 * 插件注册表管理Hook
 * 
 * 功能：
 * - 管理插件的注册和注销
 * - 提供插件查询接口
 * - 处理插件加载和错误状态
 * - 自动发现和加载插件
 */
export function usePluginRegistry() {
  const actions = usePluginRegistryActions()
  const allPlugins = useRegisteredPlugins()
  const enabledPlugins = useEnabledPlugins()
  const isInitialized = usePluginRegistryInitialized()

  // 获取插件状态
  const loadingPlugins = usePluginRegistryStore((state) => state.loadingPlugins)
  const pluginErrors = usePluginRegistryStore((state) => state.pluginErrors)

  // 初始化插件注册表
  useEffect(() => {
    if (!isInitialized) {
      actions.initialize()
      
      // 自动加载内置插件
      loadBuiltinPlugins()
    }
  }, [isInitialized, actions])

  /**
   * 加载内置插件
   */
  const loadBuiltinPlugins = async () => {
    try {
      // 动态导入内置插件
      const builtinPlugins = await discoverBuiltinPlugins()
      
      if (builtinPlugins.length > 0) {
        actions.registerPlugins(builtinPlugins)
      }
    } catch (error) {
      console.error('Failed to load builtin plugins:', error)
    }
  }

  /**
   * 发现内置插件
   */
  const discoverBuiltinPlugins = async (): Promise<CommandPalettePlugin[]> => {
    const plugins: CommandPalettePlugin[] = []

    try {
      // 尝试加载示例插件（如果存在）
      // 这里可以根据实际的插件目录结构来动态导入
      
      // 示例：加载文件搜索插件
      // const { FileSearchPlugin } = await import('../plugins/file-search-plugin')
      // plugins.push(FileSearchPlugin)
      
      // 示例：加载主题插件
      // const { ThemesStudioPlugin } = await import('../plugins/themes-studio-plugin')
      // plugins.push(ThemesStudioPlugin)
      
      console.log(`Discovered ${plugins.length} builtin plugins`)
    } catch (error) {
      console.warn('Some builtin plugins failed to load:', error)
    }

    return plugins
  }

  /**
   * 手动注册插件
   */
  const registerPlugin = async (plugin: CommandPalettePlugin) => {
    try {
      actions.setPluginLoading(plugin.id, true)
      
      // 验证插件
      validatePlugin(plugin)
      
      // 注册插件
      actions.registerPlugin(plugin)
      
      console.log(`Successfully registered plugin: ${plugin.id}`)
    } catch (error) {
      console.error(`Failed to register plugin ${plugin.id}:`, error)
      actions.setPluginError(plugin.id, error as Error)
    }
  }

  /**
   * 批量注册插件
   */
  const registerPlugins = async (plugins: CommandPalettePlugin[]) => {
    const results = await Promise.allSettled(
      plugins.map((plugin) => registerPlugin(plugin))
    )
    
    const successful = results.filter((result) => result.status === 'fulfilled').length
    const failed = results.length - successful
    
    console.log(`Plugin registration completed: ${successful} successful, ${failed} failed`)
  }

  /**
   * 验证插件
   */
  const validatePlugin = (plugin: CommandPalettePlugin) => {
    if (!plugin.id) {
      throw new Error('Plugin must have an id')
    }
    
    if (!plugin.name) {
      throw new Error('Plugin must have a name')
    }
    
    if (!plugin.publishCommands || typeof plugin.publishCommands !== 'function') {
      throw new Error('Plugin must have a publishCommands function')
    }
    
    // 检查是否已经注册
    if (actions.getPlugin(plugin.id)) {
      throw new Error(`Plugin with id "${plugin.id}" is already registered`)
    }
  }

  /**
   * 获取插件统计信息
   */
  const getPluginStats = () => {
    return {
      total: allPlugins.length,
      enabled: enabledPlugins.length,
      loading: loadingPlugins.size,
      errors: pluginErrors.size
    }
  }

  return {
    // 状态
    allPlugins,
    enabledPlugins,
    isInitialized,
    loadingPlugins: Array.from(loadingPlugins),
    pluginErrors: Object.fromEntries(pluginErrors),
    
    // 操作
    registerPlugin,
    registerPlugins,
    unregisterPlugin: actions.unregisterPlugin,
    clearAllPlugins: actions.clearAllPlugins,
    
    // 查询
    getPlugin: actions.getPlugin,
    getPluginStats,
    
    // 工具方法
    validatePlugin
  }
}

/**
 * 简化的插件访问Hook - 只返回启用的插件
 */
export function useAvailablePlugins() {
  return useEnabledPlugins()
}
