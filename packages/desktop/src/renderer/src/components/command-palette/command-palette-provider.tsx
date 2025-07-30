import { useEffect } from 'react'
import { useShortcutStore } from '../shortcuts/stores/shortcut-store'
import { useCommandPaletteActions } from './stores/command-palette-store'
import { CommandPaletteOverlay } from './command-palette-overlay'
import { CommandPaletteContext } from './command-palette-context'
import { useCommandDataSync } from './hooks/use-command-data-sync'
import { useCommandPaletteData } from './hooks/use-command-palette-data'
import { initializePlugins } from './plugins/initialize-plugins'
import type { ShortcutKey } from '../shortcuts/types/shortcut.types'
import type { CommandPaletteProviderProps, CommandPaletteContextValue, PluginConfig } from './types'

/**
 * Command Palette Provider 组件
 *
 * 功能：
 * - 提供全局上下文
 * - 处理键盘快捷键（Cmd+K/Ctrl+K）
 * - 集成现有的快捷键系统
 * - 管理插件注册表（将来实现）
 */
export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const { open } = useCommandPaletteActions()
  const register = useShortcutStore((state) => state.register)
  const unregister = useShortcutStore((state) => state.unregister)

  // 使用新的数据同步hook
  useCommandDataSync()

  // 初始化插件系统 - 在 CommandPaletteProvider 中处理
  useEffect(() => {
    initializePlugins()
  }, [])

  // 获取插件配置数据
  const commandPaletteData = useCommandPaletteData()

  // 注册 Command Palette 快捷键
  useEffect(() => {
    const shortcutId = 'command-palette-open'

    const registration = {
      id: shortcutId,
      keys: ['cmd', 'k'] as ShortcutKey[], // 在 Windows/Linux 上会自动转换为 Ctrl+K
      scope: 'global' as const,
      priority: 100, // 高优先级
      enabled: true,
      description: '打开命令面板',
      action: () => {
        open()
      }
    }

    register(registration)

    return () => {
      unregister(shortcutId)
    }
  }, [open, register, unregister])

  // 创建上下文值 - 直接使用数据，避免不必要的 useMemo
  const contextValue: CommandPaletteContextValue = {
    pluginConfigs: commandPaletteData.pluginConfigs,
    updatePluginConfig: async (pluginId: string, config: PluginConfig) => {
      await commandPaletteData.updatePluginConfig({ pluginId, config })
    },
    isLoading: commandPaletteData.isLoading
  }

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      <CommandPaletteOverlay />
    </CommandPaletteContext.Provider>
  )
}
