import React, { useEffect, useId, useMemo, cloneElement, useCallback, useRef } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@clarity/shadcn/ui/tooltip'
import type { ShortcutProps } from './types/shortcut.types'
import { useShortcuts } from './shortcut-provider'
import { validateShortcutRegistration } from './utils/conflict-detector'

// 创建一个稳定的空函数引用，避免每次渲染都创建新函数
const EMPTY_ACTION = () => {}

/**
 * 快捷键包装器组件
 * 为子组件添加快捷键功能和 tooltip 提示
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
  const registry = useShortcuts()

  // 验证快捷键 - 使用稳定的函数引用
  const validation = useMemo(() => {
    return validateShortcutRegistration({
      keys: shortcut,
      scope,
      priority,
      enabled,
      description,
      action: EMPTY_ACTION, // 使用稳定的函数引用
      condition
    })
  }, [shortcut, scope, priority, enabled, description, condition])

  // 格式化快捷键显示
  const formattedShortcut = useMemo(() => {
    return registry.formatShortcut(shortcut)
  }, [shortcut, registry])

  // 使用 ref 来稳定 childAction 的引用
  const childActionRef = useRef<(() => void) | null>(null)

  // 提取子组件的 onClick 处理函数 - 使用 useCallback 稳定引用
  const childAction = useCallback(() => {
    // 如果有自定义 action，优先使用自定义 action，不调用子组件的 onClick
    if (action) {
      return action()
    }

    // 如果没有自定义 action，则调用子组件的 onClick
    if (React.isValidElement(children) && (children.props as any).onClick) {
      return (children.props as any).onClick()
    }
    console.warn('Shortcut 组件的子组件没有 onClick 处理函数.')
  }, [children, action])

  // 更新 ref
  useEffect(() => {
    childActionRef.current = childAction
  }, [childAction])

  // 合并注册和更新逻辑到一个 useEffect 中，减少重复执行
  useEffect(() => {
    if (!validation.isValid) {
      console.error('快捷键注册失败:', validation.errors)
      return
    }

    // 创建稳定的 action 函数，使用 ref 避免闭包问题
    const stableAction = () => {
      if (childActionRef.current) {
        childActionRef.current()
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

    registry.register(registration)

    // 显示警告
    if (validation.warnings.length > 0) {
      console.warn('快捷键注册警告:', validation.warnings)
    }

    return () => {
      registry.unregister(id)
    }
  }, [
    id,
    shortcut,
    scope,
    priority,
    enabled,
    description,
    condition,
    validation.isValid
    // 注意：移除 validation.errors 和 validation.warnings，因为它们每次都是新数组
    // 只要 validation.isValid 没变，errors 和 warnings 的内容也不会变
  ])

  // 检查是否应该显示 tooltip
  const shouldShowTooltip = useMemo(() => {
    return showTooltip && validation.isValid && formattedShortcut
  }, [showTooltip, validation.isValid, formattedShortcut])

  // 生成 tooltip 内容
  const tooltipText = useMemo(() => {
    if (tooltipContent) {
      return `${tooltipContent} (${formattedShortcut})`
    }

    if (description) {
      return `${description} (${formattedShortcut})`
    }

    return formattedShortcut
  }, [tooltipContent, description, formattedShortcut])

  // 检查子组件是否支持 tooltip
  const supportsTooltip = useMemo(() => {
    if (!React.isValidElement(children)) {
      return false
    }

    // 检查是否为按钮类组件
    const componentName =
      typeof children.type === 'string'
        ? children.type
        : (children.type as any)?.displayName || (children.type as any)?.name || ''

    const supportedComponents = ['button', 'Button', 'IconButton']
    return supportedComponents.some((name) =>
      componentName.toLowerCase().includes(name.toLowerCase())
    )
  }, [children])

  // 克隆子组件，添加必要的属性
  const enhancedChild = useMemo(() => {
    if (!React.isValidElement(children)) {
      return children
    }

    // 为子组件添加 data 属性，用于调试
    const dataAttributes =
      process.env.NODE_ENV === 'development'
        ? {
            'data-shortcut': formattedShortcut,
            'data-shortcut-scope': scope,
            'data-shortcut-enabled': enabled
          }
        : {}

    // 如果有自定义 action，则移除子组件的 onClick 以避免重复执行
    const childProps = { ...(children.props as any) }
    if (action && childProps.onClick) {
      delete childProps.onClick
    }

    return cloneElement(children, {
      ...dataAttributes,
      ...childProps
    })
  }, [children, formattedShortcut, scope, enabled, action])

  // 如果验证失败，只返回原始子组件
  if (!validation.isValid) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`快捷键 ${formattedShortcut} 验证失败:`, validation.errors)
    }
    return children
  }

  // 如果不需要显示 tooltip 或子组件不支持，直接返回增强的子组件
  if (!shouldShowTooltip || !supportsTooltip) {
    return enhancedChild
  }

  // 包装 tooltip
  return (
    <Tooltip>
      <TooltipTrigger asChild>{enhancedChild}</TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * 快捷键显示组件
 * 用于在 UI 中显示格式化的快捷键
 */
export function ShortcutDisplay({
  shortcut,
  className
}: {
  shortcut: string[]
  className?: string
}) {
  const registry = useShortcuts()
  const formatted = registry.formatShortcut(shortcut as any)

  return (
    <kbd
      className={`px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded border ${className || ''}`}
    >
      {formatted}
    </kbd>
  )
}
