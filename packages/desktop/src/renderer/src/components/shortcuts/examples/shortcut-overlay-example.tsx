/**
 * 快捷键 Overlay 功能使用示例
 * 
 * 这个示例展示了如何使用新的快捷键提示 overlay 功能：
 * 1. 长按⌘键显示当前页面可用的快捷键
 * 2. 按功能分组显示
 * 3. macOS 风格的键盘符号显示
 * 4. framer-motion 动画效果
 */

import { Button } from '@clarity/shadcn/ui/button'
import { ShortcutProvider, Shortcut, useShortcutOverlay } from '../index'

export function ShortcutOverlayExample() {
  const { show, hide, isVisible } = useShortcutOverlay()

  const handleCreateProject = () => {
    console.log('创建新项目')
  }

  const handleImportFiles = () => {
    console.log('导入文件')
  }

  const handleOpenSettings = () => {
    console.log('打开设置')
  }

  const handleSearch = () => {
    console.log('搜索')
  }

  return (
    <ShortcutProvider scope="example-page" debug={true}>
      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">快捷键 Overlay 功能示例</h1>
          <p className="text-muted-foreground">
            长按 ⌘ 键查看当前页面可用的快捷键提示
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 创建操作分组 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">创建操作</h3>
            
            <Shortcut 
              shortcut={['cmd', 'n']} 
              description="创建新项目"
              priority={90}
            >
              <Button onClick={handleCreateProject} className="w-full">
                新建项目
              </Button>
            </Shortcut>
          </div>

          {/* 文件操作分组 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">文件操作</h3>
            
            <Shortcut 
              shortcut={['cmd', 'i']} 
              description="导入文件到当前项目"
              priority={80}
            >
              <Button onClick={handleImportFiles} variant="outline" className="w-full">
                导入文件
              </Button>
            </Shortcut>
          </div>

          {/* 搜索导航分组 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">搜索导航</h3>
            
            <Shortcut 
              shortcut={['cmd', 'f']} 
              description="搜索项目和文件"
              priority={70}
            >
              <Button onClick={handleSearch} variant="outline" className="w-full">
                搜索
              </Button>
            </Shortcut>
          </div>

          {/* 设置分组 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">设置</h3>
            
            <Shortcut 
              shortcut={['cmd', 'comma']} 
              description="打开应用设置"
              priority={60}
            >
              <Button onClick={handleOpenSettings} variant="outline" className="w-full">
                设置
              </Button>
            </Shortcut>
          </div>
        </div>

        {/* 手动控制 overlay */}
        <div className="border-t pt-6 space-y-4">
          <h3 className="text-lg font-semibold">手动控制 Overlay</h3>
          <div className="flex gap-2">
            <Button onClick={show} variant="outline" size="sm">
              显示快捷键提示
            </Button>
            <Button onClick={hide} variant="outline" size="sm">
              隐藏快捷键提示
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              状态: {isVisible ? '显示中' : '已隐藏'}
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="border-t pt-6 space-y-2">
          <h3 className="text-lg font-semibold">使用说明</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 长按 ⌘ 键 600ms 自动显示快捷键提示</li>
            <li>• 松开 ⌘ 键自动隐藏提示</li>
            <li>• 按 ESC 键或点击背景也可以关闭提示</li>
            <li>• 快捷键按功能自动分组显示</li>
            <li>• 支持 macOS 风格的键盘符号显示</li>
            <li>• 使用 framer-motion 提供流畅的动画效果</li>
          </ul>
        </div>
      </div>
    </ShortcutProvider>
  )
}

/**
 * 在页面中使用示例：
 * 
 * ```tsx
 * import { ShortcutOverlayExample } from './components/shortcuts/examples/shortcut-overlay-example'
 * 
 * function ExamplePage() {
 *   return <ShortcutOverlayExample />
 * }
 * ```
 */
