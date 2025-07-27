import { useMemo } from 'react'
import { useRouter } from '@tanstack/react-router'

import { createPluginContext } from '../plugins/plugin-context'
import { useCommandPaletteData, useCommandPaletteFavorites } from './use-command-palette-data'
import { useCommandPaletteActions, useCommandPaletteQuery } from '../stores/command-palette-store'
import { useRouteCommands } from './use-route-commands'
import { usePluginCommands, useSearchableCommands } from './use-plugin-commands'
import { usePluginRegistry } from '../plugins/plugin-registry'

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
  const updatePluginConfig = async (pluginId: string, config: PluginConfig) => {
    return await updateConfig({ pluginId, config })
  }

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

  // 使用新的functional hooks替换class registries
  const routeCommands = useRouteCommands(router)
  const pluginCommands = usePluginCommands()

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

  // 使用新的functional hooks获取数据
  const searchableCommands = useSearchableCommands()
  const pluginRegistry = usePluginRegistry()

  // 注册插件的方法
  const registerPlugin = useMemo(() => {
    return (plugin: CommandPalettePlugin) => {
      pluginRegistry.registerPlugin(plugin)
    }
  }, [pluginRegistry])

  // 注销插件的方法
  const unregisterPlugin = useMemo(() => {
    return (pluginId: string) => {
      pluginRegistry.unregisterPlugin(pluginId)
    }
  }, [pluginRegistry])

  // 搜索命令 - 使用新的functional架构
  const searchCommands = (searchQuery: string) => {
    // 更新查询会自动触发搜索
    setQuery(searchQuery)

    return {
      routes: routeCommands,
      commands: pluginCommands,
      total: routeCommands.length + pluginCommands.length
    }
  }

  // 获取所有可用的路由
  const getAllRoutes = () => {
    return routeCommands
  }

  // 获取可搜索的命令
  const getSearchableCommands = () => {
    return searchableCommands
  }

  // 获取能处理特定查询的命令
  const getCommandsForQuery = (searchQuery: string) => {
    return searchableCommands.filter(
      (command) => 'canHandleQuery' in command && command.canHandleQuery?.(searchQuery)
    )
  }

  // 执行命令并跟踪使用情况
  const executeCommand = async (commandId: string, command: () => void | Promise<void>) => {
    try {
      await command()
      await trackCommand({ commandId })
    } catch (error) {
      console.error(`Failed to execute command ${commandId}:`, error)
      throw error
    }
  }

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

  // 获取插件统计信息 - 使用新的functional架构
  const getPluginStats = useMemo(() => {
    return () => {
      const allRegisteredPlugins = pluginRegistry.getAllPlugins()
      const enabledPlugins = pluginRegistry.getEnabledPlugins(pluginConfigs)
      const allCommands = [...routeCommands, ...pluginCommands]
      const searchableCommandsCount = searchableCommands.length

      return {
        total: allRegisteredPlugins.length,
        enabled: enabledPlugins.length,
        disabled: allRegisteredPlugins.length - enabledPlugins.length,
        searchable: searchableCommandsCount,
        nonSearchable: allCommands.length - searchableCommandsCount,
        totalCommands: allCommands.length
      }
    }
  }, [routeCommands, pluginCommands, searchableCommands, pluginRegistry, pluginConfigs])

  // 重置插件配置
  const resetPluginConfigs = useMemo(() => {
    return async () => {
      const defaultConfigs: Record<string, PluginConfig> = {}
      const allRegisteredPlugins = pluginRegistry.getAllPlugins()

      allRegisteredPlugins.forEach((plugin, index) => {
        defaultConfigs[plugin.id] = {
          id: plugin.id,
          enabled: true,
          order: index
        }
      })

      await batchUpdateConfigs(defaultConfigs)
    }
  }, [pluginRegistry, batchUpdateConfigs])

  return {
    // 上下文
    pluginContext,

    // 数据
    pluginConfigs,
    favorites,
    recentCommands,
    query,
    routeCommands,
    pluginCommands,
    searchableCommands,

    // 搜索功能
    searchCommands,
    getAllRoutes,
    getSearchableCommands,
    getCommandsForQuery,

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
