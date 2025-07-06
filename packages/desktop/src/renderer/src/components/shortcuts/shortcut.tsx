import React, { useId, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@clarity/shadcn/ui/tooltip'
import type { ShortcutProps, ShortcutDisplayProps } from './types/shortcut.types'
import { useShortcutStore } from './stores/shortcut-store'
import { validateShortcutRegistration } from './utils/conflict-detector'

/**
 * 空操作函数 - 用于避免闭包问题
 */
const EMPTY_ACTION = () => {}

/**
 * 快捷键包装器组件 (重构版)
 * 使用 zustand store，解决 Hook 引用不稳定问题
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
  const id = useId()

  // 从 store 获取稳定的方法引用
  const register = useShortcutStore((state) => state.register)
  const unregister = useShortcutStore((state) => state.unregister)
  const formatShortcut = useShortcutStore((state) => state.formatShortcut)
  const userPreferences = useShortcutStore((state) => state.userPreferences)

  // 使用 ref 存储子组件的 action，避免闭包问题
  const childActionRef = useRef<(() => void) | null>(null)

  // 验证快捷键配置
  const validation = useMemo(() => {
    return validateShortcutRegistration({
      keys: shortcut,
      scope,
      priority,
      enabled,
      description,
      action: EMPTY_ACTION,
      condition
    })
  }, [shortcut, scope, priority, enabled, description, condition])

  // 格式化快捷键显示
  const formattedShortcut = useMemo(() => {
    return formatShortcut(shortcut)
  }, [shortcut, formatShortcut])

  // 提取子组件的 onClick 处理器
  const extractChildAction = useCallback(() => {
    if (!React.isValidElement(children)) {
      return null
    }

    // 类型安全的属性访问
    const childProps = children.props as any
    return childProps?.onClick || null
  }, [children])

  // 更新子组件 action 引用
  useEffect(() => {
    childActionRef.current = action || extractChildAction()
  }, [action, extractChildAction])

  // 注册快捷键
  useEffect(() => {
    if (!validation.isValid) {
      if (process.env.NODE_ENV === 'development') {
        console.error('快捷键注册失败:', validation.errors)
      }
      return
    }

    // 创建稳定的 action 函数
    const stableAction = () => {
      if (childActionRef.current) {
        try {
          childActionRef.current()
        } catch (error) {
          console.error('执行快捷键操作时出错:', error)
        }
      }
    }

    const registration = {
      id,
      keys: shortcut,
      scope,
      priority,
      enabled: enabled && validation.isValid,
      description,
      action: stableAction,
      condition
    }

    register(registration)

    // 显示警告
    if (process.env.NODE_ENV === 'development' && validation.warnings.length > 0) {
      console.warn('快捷键注册警告:', validation.warnings)
    }

    return () => {
      unregister(id)
    }
  }, [
    id,
    shortcut,
    scope,
    priority,
    enabled,
    description,
    condition,
    validation.isValid,
    validation.errors,
    validation.warnings,
    register,
    unregister
  ])

  // 渲染子组件
  const renderChild = () => {
    if (!React.isValidElement(children)) {
      return children
    }

    // 如果有自定义 action，不调用子组件的 onClick
    if (action) {
      return children
    }

    // 否则保持子组件的原有行为
    return children
  }

  // 生成 tooltip 内容
  const getTooltipContent = () => {
    if (tooltipContent) {
      return tooltipContent
    }

    const parts: string[] = []
    if (description) {
      parts.push(description)
    }
    if (formattedShortcut) {
      parts.push(`(${formattedShortcut})`)
    }

    return parts.join(' ')
  }

  // 如果不显示 tooltip 或用户禁用了 tooltip，直接返回子组件
  if (!showTooltip || !userPreferences.enableTooltips) {
    return renderChild()
  }

  const tooltipContentText = getTooltipContent()
  if (!tooltipContentText) {
    return renderChild()
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{renderChild()}</TooltipTrigger>
        <TooltipContent>{tooltipContentText}</TooltipContent>
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
