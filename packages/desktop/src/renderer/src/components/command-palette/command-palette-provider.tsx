import { createContext, useContext, useEffect } from 'react'
import { useShortcutStore } from '../shortcuts/stores/shortcut-store'
import { useCommandPaletteActions } from './stores/command-palette-store'
import { CommandPaletteOverlay } from './command-palette-overlay'
import type { ShortcutKey } from '../shortcuts/types/shortcut.types'
import type { CommandPaletteProviderProps, CommandPaletteContextValue } from './types'

/**
 * Command Palette Context
 */
const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

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
        console.log(123)
      }
    }

    register(registration)

    return () => {
      unregister(shortcutId)
    }
  }, [open, register, unregister])

  // 创建上下文值
  const contextValue: CommandPaletteContextValue = {
    // 将来会添加 commandRegistry, routeRegistry 等
  }

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      <CommandPaletteOverlay />
    </CommandPaletteContext.Provider>
  )
}

/**
 * 使用 Command Palette Context 的 Hook
 */
export function useCommandPaletteContext() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPaletteContext must be used within a CommandPaletteProvider')
  }
  return context
}
