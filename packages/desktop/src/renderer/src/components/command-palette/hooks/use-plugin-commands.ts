import { useEffect } from 'react'
import { createPluginCommands } from '../utils/plugin-commands'
import { useCommandPaletteStore } from '../stores/command-palette-store'
import { useCommandPaletteData } from './use-command-palette-data'

/**
 * 插件命令管理 Hook - 替换CommandRegistry类
 *
 * 功能：
 * - 使用纯函数管理插件命令
 * - 自动更新插件命令当配置变化时
 * - 管理可搜索命令列表
 */
export function usePluginCommands() {
  const { pluginConfigs } = useCommandPaletteData()

  // TODO: 获取注册的插件列表
  // const plugins = usePluginRegistry() // 需要实现插件注册表
  const plugins = [] // 临时空数组

  // 从store获取更新函数
  const updatePluginCommands = useCommandPaletteStore((state) => state.actions.updatePluginCommands)

  useEffect(() => {
    // 使用纯函数创建插件命令
    const pluginCommands = createPluginCommands(plugins, pluginConfigs)

    // 更新store中的插件命令
    updatePluginCommands(pluginCommands)

    console.log('Plugin commands updated:', pluginCommands.length)
  }, [plugins, pluginConfigs, updatePluginCommands])

  // 从store返回当前插件命令
  return useCommandPaletteStore((state) => state.pluginCommands)
}

/**
 * 可搜索命令 Hook - 用于"Use with..."功能
 */
export function useSearchableCommands() {
  // 从store返回可搜索命令
  return useCommandPaletteStore((state) => state.searchableCommands)
}
