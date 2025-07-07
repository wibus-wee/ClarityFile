import { useMemo } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@clarity/shadcn/ui/tooltip'
import type { ShortcutProps, ShortcutDisplayProps } from './types/shortcut.types'
import { useShortcutValidation } from './hooks/use-shortcut-validation'
import { useChildComponentHandler } from './hooks/use-child-component-handler'
import { useShortcutRegistration } from './hooks/use-shortcut-registration'
import { useTooltipContent } from './hooks/use-tooltip-content'
import { useShortcutStore } from './stores/shortcut-store'

/**
 * 快捷键包装器组件 (优化版)
 *
 * 重构后的组件遵循 React.dev 最佳实践：
 * - 使用自定义 Hooks 分离关注点
 * - 每个 Hook 都有单一职责
 * - 组件逻辑简化，专注于渲染
 * - 正确的依赖管理和性能优化
 */
export function Shortcut({
  shortcut,
  children,
  enabled = true,
  description,
  scope = 'page',
  priority = 50,
  showTooltip = true,
  condition,
  tooltipContent,
  action
}: ShortcutProps) {
  // 1. 验证快捷键配置
  const validation = useShortcutValidation({
    keys: shortcut,
    scope,
    priority,
    enabled,
    description,
    condition
  })

  // 2. 处理子组件逻辑
  const { renderChild, actionRef } = useChildComponentHandler(children, action)

  // 3. 注册快捷键
  useShortcutRegistration({
    keys: shortcut,
    scope,
    priority,
    enabled,
    description,
    condition,
    validation,
    actionRef
  })

  // 4. 处理 tooltip 内容
  const { shouldShowTooltip, tooltipContent: finalTooltipContent } = useTooltipContent({
    shortcut,
    description,
    customContent: tooltipContent,
    showTooltip
  })

  // 5. 渲染逻辑
  if (!shouldShowTooltip) {
    return renderChild()
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{renderChild()}</TooltipTrigger>
        <TooltipContent>{finalTooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * 快捷键显示组件 (重构版)
 * 用于在 UI 中显示格式化的快捷键
 */
export function ShortcutDisplay({
  shortcut,
  className = '',
  variant = 'default'
}: ShortcutDisplayProps) {
  const formatShortcut = useShortcutStore((state) => state.formatShortcut)

  const formattedShortcut = useMemo(() => {
    return formatShortcut(shortcut)
  }, [shortcut, formatShortcut])

  const baseClasses = 'inline-flex items-center gap-1 text-xs font-mono'
  const variantClasses = {
    default: 'text-muted-foreground',
    badge: 'bg-muted text-muted-foreground px-1.5 py-0.5 rounded',
    key: 'bg-background border border-border px-1 py-0.5 rounded shadow-sm'
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {formattedShortcut}
    </span>
  )
}
