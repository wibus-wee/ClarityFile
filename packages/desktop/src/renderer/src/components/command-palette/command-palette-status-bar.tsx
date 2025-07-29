import { useAllCommands, useCommandPaletteActiveCommand } from './stores/command-palette-store'

/**
 * Command Palette 底部状态栏组件
 *
 * 功能：
 * - 显示当前状态（搜索模式 vs 命令详情模式）
 * - 显示快捷键提示
 * - 模仿 Raycast 的底部状态栏设计
 */
export function CommandPaletteStatusBar() {
  const activeCommandId = useCommandPaletteActiveCommand()
  const allCommands = useAllCommands()

  // 查找当前激活的命令
  const activeCommand = activeCommandId
    ? allCommands.find((cmd) => cmd.id === activeCommandId)
    : null

  // 是否在 details view
  const isInDetailsView = !!activeCommand

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/20 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        {isInDetailsView && activeCommand ? (
          <>
            {activeCommand.icon && <activeCommand.icon className="h-3.5 w-3.5 opacity-70" />}
            <span className="font-medium">{activeCommand.title}</span>
          </>
        ) : (
          <>
            <span className="font-medium text-foreground/60">ClarityFile</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isInDetailsView ? (
          <div className="flex items-center gap-1.5">
            <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-[10px] font-medium bg-background/80 border border-border/60 rounded-md shadow-sm">
              ←
            </kbd>
            <span className="text-muted-foreground/80">Back</span>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-[10px] font-medium bg-background/80 border border-border/60 rounded-md shadow-sm">
                ↵
              </kbd>
              <span className="text-muted-foreground/80">Select</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-[10px] font-medium bg-background/80 border border-border/60 rounded-md shadow-sm">
                Esc
              </kbd>
              <span className="text-muted-foreground/80">Close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
