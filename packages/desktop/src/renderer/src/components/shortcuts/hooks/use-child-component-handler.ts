import React, { useRef, useCallback, useEffect } from 'react'

/**
 * 子组件处理 Hook 的返回类型
 */
export interface ChildComponentHandlerResult {
  /** 合并后的 ref 函数 */
  mergedRef: (element: HTMLElement | null) => void
  /** 渲染处理后的子组件 */
  renderChild: () => React.ReactNode
  /** 当前的 action 函数引用 */
  actionRef: React.MutableRefObject<(() => void) | null>
}

/**
 * 子组件处理 Hook
 * 
 * 职责：
 * - 提取子组件的 onClick 处理器
 * - 合并 ref 引用，支持模拟点击
 * - 处理子组件的克隆和属性注入
 * 
 * 这个 Hook 遵循 React.dev 最佳实践：
 * - 使用 useCallback 优化函数引用
 * - 使用 useRef 避免闭包问题
 * - 分离关注点，专注于子组件处理逻辑
 */
export function useChildComponentHandler(
  children: React.ReactElement,
  customAction?: () => void
): ChildComponentHandlerResult {
  // 存储子组件的 action 函数，避免闭包问题
  const actionRef = useRef<(() => void) | null>(null)
  
  // 存储子组件的 DOM 元素，用于模拟点击
  const elementRef = useRef<HTMLElement>(null)

  // 模拟点击函数
  const simulateClick = useCallback(() => {
    if (elementRef.current) {
      try {
        elementRef.current.click()
      } catch (error) {
        console.error('模拟点击失败:', error)
      }
    }
  }, [])

  // 提取子组件的 onClick 处理器
  const extractChildAction = useCallback(() => {
    if (!React.isValidElement(children)) {
      return null
    }

    // 类型安全的属性访问
    const childProps = children.props as any
    const childOnClick = childProps?.onClick

    // 如果子组件有 onClick 处理器，使用它
    if (childOnClick) {
      return childOnClick
    }

    // 如果子组件没有 onClick 处理器，返回模拟点击函数
    return simulateClick
  }, [children, simulateClick])

  // 更新 action 引用
  useEffect(() => {
    actionRef.current = customAction || extractChildAction()
  }, [customAction, extractChildAction])

  // 合并 ref 函数
  const mergedRef = useCallback((element: HTMLElement | null) => {
    // 设置我们的 ref
    elementRef.current = element

    // 如果子组件已有 ref，也要调用它
    if (React.isValidElement(children)) {
      const childProps = children.props as any
      const existingRef = childProps.ref

      if (existingRef) {
        if (typeof existingRef === 'function') {
          existingRef(element)
        } else if (existingRef && typeof existingRef === 'object') {
          existingRef.current = element
        }
      }
    }
  }, [children])

  // 渲染子组件
  const renderChild = useCallback(() => {
    if (!React.isValidElement(children)) {
      return children
    }

    // 克隆子组件并添加 ref
    return React.cloneElement(children as any, {
      ref: mergedRef
    })
  }, [children, mergedRef])

  return {
    mergedRef,
    renderChild,
    actionRef
  }
}
