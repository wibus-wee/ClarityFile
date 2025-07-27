import { Command } from 'cmdk'
import { ArrowLeft } from 'lucide-react'
import {
  useCommandPaletteActiveCommand,
  useCommandPaletteActions,
  useCommandPaletteQuery,
  useAllCommands
} from '../stores/command-palette-store'
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
  const { setActiveCommand } = useCommandPaletteActions()
  const query = useCommandPaletteQuery()
  const allCommands = useAllCommands()
  const pluginContext = useCommandPaletteContext()

  // 如果没有激活的命令，不渲染
  if (!activeCommandId) {
    return null
  }

  // 查找激活的命令
  const activeCommand = allCommands.find((cmd) => cmd.id === activeCommandId)

  // 如果找不到命令或命令没有 render 方法，显示错误
  if (!activeCommand || !('render' in activeCommand)) {
    return (
      <Command.List className="max-h-[300px] overflow-y-auto">
        <div className="p-4">
          <CommandViewHeader title="命令未找到" onBack={() => setActiveCommand(null)} />
          <div className="mt-4 text-sm text-muted-foreground">
            命令 "{activeCommandId}" 不存在或不支持渲染视图
          </div>
        </div>
      </Command.List>
    )
  }

  const renderCommand = activeCommand as CommandWithRender

  return (
    <Command.List className="max-h-[300px] overflow-y-auto">
      <div className="p-4">
        <CommandViewHeader
          title={renderCommand.title}
          subtitle={renderCommand.subtitle}
          query={query}
          onBack={() => setActiveCommand(null)}
        />

        <div className="mt-4">
          {/* 渲染命令的具体内容 */}
          {renderCommand.render(pluginContext)}
        </div>
      </div>
    </Command.List>
  )
}

/**
 * 命令视图头部组件
 */
interface CommandViewHeaderProps {
  title: string
  subtitle?: string
  query?: string
  onBack: () => void
}

function CommandViewHeader({ title, subtitle, query, onBack }: CommandViewHeaderProps) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-border">
      <button
        onClick={onBack}
        className="flex items-center justify-center w-6 h-6 rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        title="返回"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
        {query && <div className="text-xs text-muted-foreground mt-1">查询: "{query}"</div>}
      </div>
    </div>
  )
}
