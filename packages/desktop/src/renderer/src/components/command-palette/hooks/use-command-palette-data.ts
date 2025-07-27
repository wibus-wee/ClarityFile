import { useMemo } from 'react'
import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'
import { tipcClient } from '@renderer/lib/tipc-client'
import type { CommandPalettePlugin, PluginConfig } from '../types'

/**
 * 插件配置工具函数
 */
export const pluginConfigUtils = {
  /**
   * 获取插件默认配置
   */
  getDefaultConfig: (plugin: CommandPalettePlugin): PluginConfig => ({
    id: plugin.id,
    enabled: true,
    order: 0
  }),

  /**
   * 初始化插件配置
   */
  initializePluginConfig: (
    plugin: CommandPalettePlugin,
    existingConfigs: Record<string, PluginConfig>
  ): PluginConfig => {
    return existingConfigs[plugin.id] || pluginConfigUtils.getDefaultConfig(plugin)
  },

  /**
   * 解析插件配置
   */
  parsePluginConfigs: (
    settings: Array<{ key: string; value: any }>
  ): Record<string, PluginConfig> => {
    const configs: Record<string, PluginConfig> = {}

    settings.forEach((setting) => {
      if (setting.key.startsWith('plugin-')) {
        const pluginId = setting.key.replace('plugin-', '')
        try {
          configs[pluginId] =
            typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value
        } catch (error) {
          console.error(`Failed to parse plugin config for ${pluginId}:`, error)
        }
      }
    })

    return configs
  }
}

/**
 * 命令面板数据管理 Hook
 *
 * 功能：
 * - 管理插件配置的 CRUD 操作
 * - 使用 SWR 进行数据缓存和同步
 * - 提供类型安全的数据访问
 */
export function useCommandPaletteData() {
  // 获取命令面板相关设置
  const {
    data: settingsData,
    isLoading,
    error
  } = useSWR(['settings', 'command-palette'], () =>
    tipcClient.getSettingsByCategory({ category: 'command-palette' })
  )

  // 更新单个插件配置
  const { trigger: updatePluginConfig, isMutating: isUpdatingConfig } = useSWRMutation(
    ['plugin-config'],
    async (_key, { arg }: { arg: { pluginId: string; config: PluginConfig } }) => {
      const result = await tipcClient.setSetting({
        key: `plugin-${arg.pluginId}`,
        value: arg.config,
        category: 'command-palette',
        description: `Configuration for ${arg.pluginId} plugin`,
        isUserModifiable: true
      })

      // 重新验证插件配置数据
      mutate(['settings', 'command-palette'])
      return result
    }
  )

  // 批量更新插件配置
  const { trigger: batchUpdateConfigs, isMutating: isBatchUpdating } = useSWRMutation(
    ['plugin-configs-batch'],
    async (_key, { arg }: { arg: Record<string, PluginConfig> }) => {
      const settingsToSave = Object.entries(arg).map(([pluginId, config]) => ({
        key: `plugin-${pluginId}`,
        value: config,
        category: 'command-palette',
        description: `Configuration for ${pluginId} plugin`,
        isUserModifiable: true
      }))

      const result = await tipcClient.setSettings(settingsToSave)
      mutate(['settings', 'command-palette'])
      return result
    }
  )

  // 解析插件配置
  const pluginConfigs = useMemo(
    () => pluginConfigUtils.parsePluginConfigs(settingsData || []),
    [settingsData]
  )

  return {
    // 数据
    pluginConfigs,
    isLoading,
    error,

    // 操作
    updatePluginConfig,
    batchUpdateConfigs,

    // 状态
    isUpdatingConfig,
    isBatchUpdating
  }
}

/**
 * 收藏和历史记录管理 Hook
 *
 * 功能：
 * - 管理用户收藏的命令
 * - 跟踪最近使用的命令
 * - 提供使用频率统计
 */
export function useCommandPaletteFavorites() {
  // 获取收藏列表
  const { data: favorites = [], isLoading: isLoadingFavorites } = useSWR(
    ['command-palette-favorites'],
    () =>
      tipcClient
        .getSetting({ key: 'favorites' })
        .then((result) => (result?.value ? JSON.parse(result.value as string) : []))
        .catch(() => [])
  )

  // 获取最近使用的命令
  const { data: recentCommands = [], isLoading: isLoadingRecent } = useSWR(
    ['command-palette-recent'],
    () =>
      tipcClient
        .getSetting({ key: 'recent-commands' })
        .then((result) => (result?.value ? JSON.parse(result.value as string) : []))
        .catch(() => [])
  )

  // 添加到收藏
  const { trigger: addToFavorites } = useSWRMutation(
    ['add-favorite'],
    async (_key, { arg }: { arg: string }) => {
      const newFavorites = [...new Set([...favorites, arg])]
      const result = await tipcClient.setSetting({
        key: 'favorites',
        value: JSON.stringify(newFavorites),
        category: 'command-palette',
        description: 'User favorite commands',
        isUserModifiable: true
      })

      mutate(['command-palette-favorites'])
      return result
    }
  )

  // 从收藏中移除
  const { trigger: removeFromFavorites } = useSWRMutation(
    ['remove-favorite'],
    async (_key, { arg }: { arg: string }) => {
      const newFavorites = favorites.filter((id: string) => id !== arg)
      const result = await tipcClient.setSetting({
        key: 'favorites',
        value: JSON.stringify(newFavorites),
        category: 'command-palette',
        description: 'User favorite commands',
        isUserModifiable: true
      })

      mutate(['command-palette-favorites'])
      return result
    }
  )

  // 跟踪命令使用
  const { trigger: trackCommand } = useSWRMutation(
    ['track-command'],
    async (_key, { arg }: { arg: { commandId: string } }) => {
      const now = Date.now()
      const existingCommand = recentCommands.find((cmd: any) => cmd.commandId === arg.commandId)

      let newRecentCommands
      if (existingCommand) {
        // 更新现有命令的频率和时间戳
        newRecentCommands = recentCommands.map((cmd: any) =>
          cmd.commandId === arg.commandId
            ? { ...cmd, timestamp: now, frequency: cmd.frequency + 1 }
            : cmd
        )
      } else {
        // 添加新命令
        newRecentCommands = [
          { commandId: arg.commandId, timestamp: now, frequency: 1 },
          ...recentCommands
        ]
      }

      // 保持最近 50 个命令
      newRecentCommands = newRecentCommands
        .sort((a: any, b: any) => b.timestamp - a.timestamp)
        .slice(0, 50)

      const result = await tipcClient.setSetting({
        key: 'recent-commands',
        value: JSON.stringify(newRecentCommands),
        category: 'command-palette',
        description: 'Recently used commands',
        isUserModifiable: true
      })

      mutate(['command-palette-recent'])
      return result
    }
  )

  return {
    // 数据
    favorites,
    recentCommands,

    // 状态
    isLoadingFavorites,
    isLoadingRecent,

    // 操作
    addToFavorites,
    removeFromFavorites,
    trackCommand
  }
}
