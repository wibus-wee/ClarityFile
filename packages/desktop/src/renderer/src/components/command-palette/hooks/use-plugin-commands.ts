import { useMemo } from 'react'
import { createPluginCommands } from '../utils/plugin-commands'
import { useSearchableCommands } from '../stores/command-palette-store'
import { useCommandPaletteData } from './use-command-palette-data'
import { usePluginRegistryStore } from '../plugins/plugin-registry'

/**
 * 插件命令管理 Hook
 *
 * 功能：
 * - 使用纯函数管理插件命令
 * - 自动更新插件命令当配置变化时
 * - 管理可搜索命令列表
 */
export function usePluginCommands() {
  const { pluginConfigs } = useCommandPaletteData()

  // ✅ 订阅插件数组以响应注册表的更新
  const registeredPlugins = usePluginRegistryStore((state) => state.pluginsArray)

  // ✅ 使用useMemo计算插件命令，依赖插件数量变化来触发重新计算
  const pluginCommands = useMemo(() => {
    return createPluginCommands(registeredPlugins, pluginConfigs)
  }, [pluginConfigs, registeredPlugins])

  return pluginCommands
}

/**
 * 可搜索命令 Hook - 用于"Use with..."功能
 * 重新导出store中的selector
 */
export { useSearchableCommands }
