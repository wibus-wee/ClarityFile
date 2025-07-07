/**
 * 优化后的 Shortcut 组件使用示例
 * 
 * 展示重构后的组件如何遵循 React.dev 最佳实践：
 * - 清晰的组件结构
 * - 分离的关注点
 * - 可复用的自定义 Hooks
 */

import React from 'react'
import { Button } from '@clarity/shadcn/ui/button'
import { 
  Shortcut, 
  ShortcutDisplay,
  useShortcutValidation,
  useChildComponentHandler,
  useShortcutRegistration,
  useTooltipContent
} from '../index'

/**
 * 基本用法示例
 */
export function BasicUsageExample() {
  const handleNewProject = () => {
    console.log('创建新项目')
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">基本用法</h3>
      
      {/* 简单的快捷键包装 */}
      <Shortcut
        shortcut={['cmd', 'n']}
        description="创建新项目"
        action={handleNewProject}
      >
        <Button>新建项目</Button>
      </Shortcut>

      {/* 显示快捷键 */}
      <div className="flex items-center gap-2">
        <span>快捷键：</span>
        <ShortcutDisplay shortcut={['cmd', 'n']} variant="key" />
      </div>
    </div>
  )
}

/**
 * 高级用法示例 - 使用自定义 Hooks
 */
export function AdvancedUsageExample() {
  const [isEnabled, setIsEnabled] = React.useState(true)

  // 1. 使用验证 Hook
  const validation = useShortcutValidation({
    keys: ['cmd', 'shift', 's'],
    scope: 'page',
    priority: 100,
    enabled: isEnabled,
    description: '保存所有文件'
  })

  // 2. 使用子组件处理 Hook
  const saveButton = <Button variant="outline">保存所有</Button>
  const { renderChild, actionRef } = useChildComponentHandler(
    saveButton,
    () => console.log('保存所有文件')
  )

  // 3. 使用注册 Hook
  useShortcutRegistration({
    keys: ['cmd', 'shift', 's'],
    scope: 'page',
    priority: 100,
    enabled: isEnabled,
    description: '保存所有文件',
    validation,
    actionRef
  })

  // 4. 使用 tooltip 内容 Hook
  const { shouldShowTooltip, tooltipContent } = useTooltipContent({
    shortcut: ['cmd', 'shift', 's'],
    description: '保存所有文件',
    showTooltip: true
  })

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">高级用法 - 自定义 Hooks</h3>
      
      <div className="flex items-center gap-2">
        <label>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
          />
          启用快捷键
        </label>
      </div>

      <div className="space-y-2">
        <p>验证状态: {validation.isValid ? '✅ 有效' : '❌ 无效'}</p>
        <p>显示 Tooltip: {shouldShowTooltip ? '是' : '否'}</p>
        <p>Tooltip 内容: {tooltipContent}</p>
      </div>

      {renderChild()}
    </div>
  )
}

/**
 * 性能优化示例
 */
export function PerformanceExample() {
  const [count, setCount] = React.useState(0)

  // 使用 useCallback 优化 action 函数
  const handleIncrement = React.useCallback(() => {
    setCount(prev => prev + 1)
  }, [])

  // 使用 useMemo 优化条件函数
  const isEvenCondition = React.useMemo(() => {
    return () => count % 2 === 0
  }, [count])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">性能优化示例</h3>
      
      <p>当前计数: {count}</p>
      <p>快捷键仅在偶数时生效</p>

      <Shortcut
        shortcut={['space']}
        description="增加计数"
        action={handleIncrement}
        condition={isEvenCondition}
      >
        <Button>增加 (+1)</Button>
      </Shortcut>
    </div>
  )
}

/**
 * 完整示例组件
 */
export function OptimizedShortcutExample() {
  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold">优化后的 Shortcut 组件示例</h2>
      
      <div className="grid gap-8">
        <BasicUsageExample />
        <AdvancedUsageExample />
        <PerformanceExample />
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-2">优化要点：</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>使用自定义 Hooks 分离关注点</li>
          <li>每个 Hook 都有单一职责</li>
          <li>正确使用 useCallback 和 useMemo 优化性能</li>
          <li>清晰的依赖数组管理</li>
          <li>组件逻辑简化，专注于渲染</li>
          <li>遵循 React.dev 最佳实践</li>
        </ul>
      </div>
    </div>
  )
}
