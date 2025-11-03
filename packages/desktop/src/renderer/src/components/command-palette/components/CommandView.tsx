import { Command } from 'cmdk'
import { useCommandPaletteActiveCommand, useAllCommands } from '../stores/command-palette-store'
import { useCommandPaletteContext } from '../hooks/use-command-palette-context'
import type { CommandWithRender } from '../types'

/**
 * 命令视图组件
 *
 * 功能：
 * - 渲染激活命令的具体内容
 * - 提供返回导航
 * - 为插件提供上下文
 */
export function CommandView() {
  const activeCommandId = useCommandPaletteActiveCommand()
  const allCommands = useAllCommands()

  const activeCommand = activeCommandId
    ? allCommands.find((cmd) => cmd.id === activeCommandId)
    : undefined

  const pluginId = activeCommand && 'pluginId' in activeCommand ? activeCommand.pluginId : undefined
  const pluginContext = useCommandPaletteContext(pluginId)

  // 如果没有激活的命令，不渲染
  if (!activeCommandId) {
    return null
  }

  // 查找激活的命令
  const command = activeCommand

  // 如果找不到命令或命令没有 render 方法，显示错误
  if (!command || !('render' in command)) {
    return (
      <Command.List className="h-[380px] overflow-y-auto px-2 py-2">
        <div className="p-4">
          <div className="mt-4 text-sm text-muted-foreground/70 font-medium">
            命令 &quot;{activeCommandId}&quot; 不存在或不支持渲染视图
          </div>
        </div>
      </Command.List>
    )
  }

  const renderCommand = command as CommandWithRender

  return (
    <Command.List className="h-[380px] overflow-y-auto px-2 py-2">
      <div>{renderCommand.render(pluginContext)}</div>
    </Command.List>
  )
}
