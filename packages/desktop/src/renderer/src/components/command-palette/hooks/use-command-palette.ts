import { useMemo } from 'react'
import { useRouter } from '@tanstack/react-router'
import { CommandRegistry } from '../core/command-registry'
import { useRouteRegistry } from '../core/route-registry'

import { createPluginContext } from '../plugins/plugin-context'
import { useCommandPaletteData, useCommandPaletteFavorites } from './use-command-palette-data'
import { useCommandPaletteActions, useCommandPaletteQuery } from '../stores/command-palette-store'
import type { CommandPalettePlugin, PluginConfig, PluginContext } from '../types'

/**
 * 统一的命令面板数据管理 Hook
 *
 * 功能：
 * - 整合所有命令面板相关的数据和操作
 * - 提供统一的 API 接口
 * - 管理插件注册表和路由注册表
 * - 处理插件配置和用户偏好
 */
export function useCommandPalette() {
  const router = useRouter()
  const { close, setQuery } = useCommandPaletteActions()
  const query = useCommandPaletteQuery()

  // 获取插件配置数据
  const {
    pluginConfigs,
    updatePluginConfig: updateConfig,
    batchUpdateConfigs,
    isLoading: isLoadingConfigs,
    isUpdatingConfig,
    isBatchUpdating
  } = useCommandPaletteData()

  // 包装 updatePluginConfig 函数以匹配接口
  const updatePluginConfig = useMemo(() => {
    return async (pluginId: string, config: PluginConfig) => {
      return await updateConfig({ pluginId, config })
    }
  }, [updateConfig])

  // 获取收藏和历史记录
  const {
    favorites,
    recentCommands,
    addToFavorites,
    removeFromFavorites,
    trackCommand,
    isLoadingFavorites,
    isLoadingRecent
  } = useCommandPaletteFavorites()

  // 初始化路由注册表
  const routeRegistry = useRouteRegistry(router)

  // 初始化命令注册表
  const commandRegistry = useMemo(() => {
    return new CommandRegistry(pluginConfigs)
  }, [pluginConfigs])

  // 创建插件上下文
  const pluginContext = useMemo((): PluginContext => {
    return createPluginContext(
      router,
      {
        close,
        setQuery,
        getQuery: () => query,
        goBack: () => {
          // 这里可以实现返回逻辑
          console.log('Go back')
        }
      },
      {
        // 这里可以注入具体的服务实现
        files: undefined,
        themes: undefined,
        settings: undefined
      },
      {
        language: 'zh-CN',
        theme: 'system',
        shortcuts: {}
      }
    )
  }, [router, close, setQuery, query])

  // 注册插件的方法
  const registerPlugin = useMemo(() => {
    return (plugin: CommandPalettePlugin) => {
      commandRegistry.registerPlugin(plugin)
    }
  }, [commandRegistry])

  // 注销插件的方法
  const unregisterPlugin = useMemo(() => {
    return (pluginId: string) => {
      commandRegistry.unregisterPlugin(pluginId)
    }
  }, [commandRegistry])

  // 搜索命令
  const searchCommands = useMemo(() => {
    return (searchQuery: string) => {
      const routeCommands = routeRegistry?.search(searchQuery) || []
      const pluginCommands = commandRegistry.search(searchQuery)

      return {
        routes: routeCommands,
        commands: pluginCommands,
        total: routeCommands.length + pluginCommands.length
      }
    }
  }, [routeRegistry, commandRegistry])

  // 获取所有可用的路由
  const getAllRoutes = useMemo(() => {
    return () => {
      return routeRegistry?.getAllRoutes() || []
    }
  }, [routeRegistry])

  // 获取可搜索的插件
  const getSearchablePlugins = useMemo(() => {
    return () => {
      return commandRegistry.getSearchablePlugins()
    }
  }, [commandRegistry])

  // 获取能处理特定查询的插件
  const getPluginsForQuery = useMemo(() => {
    return (searchQuery: string) => {
      return commandRegistry.getPluginsForQuery(searchQuery)
    }
  }, [commandRegistry])

  // 执行命令并跟踪使用情况
  const executeCommand = useMemo(() => {
    return async (commandId: string, command: () => void | Promise<void>) => {
      try {
        await command()
        await trackCommand({ commandId })
      } catch (error) {
        console.error(`Failed to execute command ${commandId}:`, error)
        throw error
      }
    }
  }, [trackCommand])

  // 切换收藏状态
  const toggleFavorite = useMemo(() => {
    return async (commandId: string) => {
      if (favorites.includes(commandId)) {
        await removeFromFavorites(commandId)
      } else {
        await addToFavorites(commandId)
      }
    }
  }, [favorites, removeFromFavorites, addToFavorites])

  // 获取插件统计信息 - 直接从 commandRegistry 获取，避免创建临时对象
  const getPluginStats = useMemo(() => {
    return () => {
      const searchablePlugins = commandRegistry.getSearchablePlugins()
      const allCommands = commandRegistry.getAllCommands()

      return {
        total: searchablePlugins.length,
        enabled: searchablePlugins.length,
        disabled: 0, // 因为我们只获取启用的插件
        searchable: searchablePlugins.filter((p) => p.searchable).length,
        nonSearchable: searchablePlugins.filter((p) => !p.searchable).length,
        totalCommands: allCommands.length
      }
    }
  }, [commandRegistry])

  // 重置插件配置
  const resetPluginConfigs = useMemo(() => {
    return async () => {
      const defaultConfigs: Record<string, PluginConfig> = {}
      commandRegistry.getSearchablePlugins().forEach((plugin) => {
        defaultConfigs[plugin.id] = {
          id: plugin.id,
          enabled: true,
          searchable: plugin.searchable ?? false,
          order: 0
        }
      })
      await batchUpdateConfigs(defaultConfigs)
    }
  }, [commandRegistry, batchUpdateConfigs])

  return {
    // 注册表
    routeRegistry,
    commandRegistry,
    pluginContext,

    // 数据
    pluginConfigs,
    favorites,
    recentCommands,
    query,

    // 搜索功能
    searchCommands,
    getAllRoutes,
    getSearchablePlugins,
    getPluginsForQuery,

    // 插件管理
    registerPlugin,
    unregisterPlugin,
    getPluginStats,

    // 配置管理
    updatePluginConfig,
    batchUpdateConfigs,
    resetPluginConfigs,

    // 用户操作
    executeCommand,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    trackCommand,

    // 状态
    isLoading: isLoadingConfigs || isLoadingFavorites || isLoadingRecent,
    isUpdatingConfig,
    isBatchUpdating,
    isLoadingFavorites,
    isLoadingRecent
  }
}

/**
 * 命令面板数据的类型定义
 */
export type CommandPaletteData = ReturnType<typeof useCommandPalette>
