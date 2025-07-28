import { Command } from 'cmdk'
import { ArrowLeft } from 'lucide-react'
import {
  useCommandPaletteQuery,
  useCommandPaletteActions,
  useCommandPaletteActiveCommand
} from './stores/command-palette-store'

/**
 * Command Palette 搜索输入组件
 *
 * 功能：
 * - 使用 cmdk 的 Command.Input 组件
 * - 处理实时搜索查询更新
 * - 提供占位符文本
 * - 支持键盘导航
 * - 智能 Backspace 行为：在 details view 中先清除搜索，再返回主视图
 * - 状态感知的图标显示（搜索图标 vs 返回箭头）
 */
export function CommandPaletteInput() {
  const query = useCommandPaletteQuery()
  const activeCommand = useCommandPaletteActiveCommand()
  const { setQuery, goBackToRoot } = useCommandPaletteActions()

  // 是否在 details view
  const isInDetailsView = !!activeCommand

  // 处理返回按钮点击
  const handleBackClick = () => {
    goBackToRoot()
  }

  // 处理键盘事件 - 智能 Backspace 行为
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && isInDetailsView) {
      // 如果在 details view 中
      if (query.trim() === '') {
        // 搜索为空时，返回主视图
        e.preventDefault()
        goBackToRoot()
      }
      // 如果有搜索内容，让默认行为清除搜索内容（不阻止事件）
    }
  }

  return (
    <div className="flex items-center border-b border-border/30 px-4 py-1">
      {isInDetailsView ? (
        <button
          onClick={handleBackClick}
          className="mr-3 h-7 w-7 shrink-0 opacity-60 bg-muted hover:opacity-100 transition-all duration-200 cursor-pointer rounded-sm hover:bg-accent/50 p-0.5 -m-0.5"
          title="返回"
        >
          <ArrowLeft className="h-4 w-4 mx-auto" />
        </button>
      ) : (
        <></>
      )}
      <Command.Input
        value={query}
        onValueChange={setQuery}
        onKeyDown={handleKeyDown}
        placeholder={isInDetailsView ? '在命令中搜索...' : '搜索命令或页面...'}
        className="flex h-12 w-full text-base rounded-md bg-transparent py-3 outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
      />
    </div>
  )
}
