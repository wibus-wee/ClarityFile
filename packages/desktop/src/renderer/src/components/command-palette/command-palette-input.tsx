import { Command } from 'cmdk'
import { Search } from 'lucide-react'
import { useCommandPaletteQuery, useCommandPaletteActions } from './stores/command-palette-store'

/**
 * Command Palette 搜索输入组件
 *
 * 功能：
 * - 使用 cmdk 的 Command.Input 组件
 * - 处理实时搜索查询更新
 * - 提供占位符文本
 * - 支持键盘导航
 */
export function CommandPaletteInput() {
  const query = useCommandPaletteQuery()
  const { setQuery } = useCommandPaletteActions()

  return (
    <div className="flex items-center border-b px-3">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <Command.Input
        value={query}
        onValueChange={setQuery}
        placeholder="搜索命令、页面或文件..."
        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}
