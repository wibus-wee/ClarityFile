import { Command } from 'cmdk'
import {
  useCommandPaletteQuery,
  useCommandPaletteActivePlugin
} from './stores/command-palette-store'

/**
 * Command Palette 结果显示组件
 *
 * 功能：
 * - 渲染不同的结果部分（收藏、建议、搜索结果）
 * - 处理 "Use with..." 功能
 * - 支持键盘导航
 * - 显示插件特定的结果格式
 */
export function CommandPaletteResults() {
  const query = useCommandPaletteQuery()
  const activePlugin = useCommandPaletteActivePlugin()

  // 如果有激活的插件，显示插件视图
  if (activePlugin) {
    return (
      <Command.List className="max-h-[300px] overflow-y-auto">
        <div className="p-4">
          <div className="text-sm text-muted-foreground">插件视图: {activePlugin}</div>
          <div className="mt-2 text-sm">查询: &quot;{query}&quot;</div>
          {/* 这里将来会渲染插件的具体内容 */}
        </div>
      </Command.List>
    )
  }

  // 主要结果视图
  return (
    <Command.List className="max-h-[300px] overflow-y-auto">
      {query.length === 0 ? (
        // 空查询时显示收藏和建议
        <div className="p-4">
          <Command.Group heading="收藏">
            <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
              <span>暂无收藏命令</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="建议">
            <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
              <span>创建新项目</span>
            </Command.Item>
            <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
              <span>搜索文件</span>
            </Command.Item>
          </Command.Group>
        </div>
      ) : (
        // 有查询时显示搜索结果
        <div className="p-4">
          <Command.Group heading="搜索结果">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              未找到相关命令
            </Command.Empty>

            {/* 临时的示例结果 */}
            <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
              <span>示例命令: {query}</span>
            </Command.Item>
          </Command.Group>

          {/* "Use with..." 部分 */}
          <Command.Group heading={`使用 "${query}" 搜索...`}>
            <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
              <span>文件搜索</span>
            </Command.Item>
            <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
              <span>主题工作室</span>
            </Command.Item>
          </Command.Group>
        </div>
      )}
    </Command.List>
  )
}
