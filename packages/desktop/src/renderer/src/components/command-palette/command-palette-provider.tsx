import { useEffect, useMemo } from 'react'
import { useShortcutStore } from '../shortcuts/stores/shortcut-store'
import { useCommandPaletteActions } from './stores/command-palette-store'
import { CommandPaletteOverlay } from './command-palette-overlay'
import { CommandPaletteContext } from './command-palette-context'
import { useCommandPalette } from './hooks/use-command-palette'
import type { ShortcutKey } from '../shortcuts/types/shortcut.types'
import type { CommandPaletteProviderProps, CommandPaletteContextValue } from './types'

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

  // 使用统一的命令面板数据管理 hook
  const commandPaletteData = useCommandPalette()

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

  // 创建上下文值 - 使用 useMemo 避免不必要的重新渲染
  const contextValue: CommandPaletteContextValue = useMemo(
    () => ({
      pluginConfigs: commandPaletteData.pluginConfigs,
      updatePluginConfig: commandPaletteData.updatePluginConfig,
      isLoading: commandPaletteData.isLoading
    }),
    [
      commandPaletteData.pluginConfigs,
      commandPaletteData.updatePluginConfig,
      commandPaletteData.isLoading
    ]
  )

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      <CommandPaletteOverlay />
    </CommandPaletteContext.Provider>
  )
}
