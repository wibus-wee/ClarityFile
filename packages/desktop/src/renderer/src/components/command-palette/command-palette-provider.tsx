import { useEffect, useMemo } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useShortcutStore } from '../shortcuts/stores/shortcut-store'
import { useCommandPaletteActions } from './stores/command-palette-store'
import { CommandPaletteOverlay } from './command-palette-overlay'
import { CommandPaletteContext } from './command-palette-context'
import { useRouteRegistry } from './core/route-registry'
import { CommandRegistry } from './core/command-registry'
import { useCommandPaletteData } from './hooks/use-command-palette-data'
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
  const router = useRouter()

  // 获取插件配置数据
  const { pluginConfigs, updatePluginConfig: updateConfig, isLoading } = useCommandPaletteData()

  // 初始化路由注册表
  const routeRegistry = useRouteRegistry(router)

  // 初始化命令注册表
  const commandRegistry = useMemo(() => {
    return new CommandRegistry(pluginConfigs)
  }, [pluginConfigs])

  // 包装 updatePluginConfig 函数以匹配接口
  const updatePluginConfig = useMemo(() => {
    return async (pluginId: string, config: PluginConfig) => {
      return await updateConfig({ pluginId, config })
    }
  }, [updateConfig])

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

  // 创建上下文值
  const contextValue: CommandPaletteContextValue = {
    commandRegistry,
    routeRegistry,
    pluginConfigs,
    updatePluginConfig,
    isLoading
  }

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      <CommandPaletteOverlay />
    </CommandPaletteContext.Provider>
  )
}
