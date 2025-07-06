import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  ShortcutRegistration,
  ShortcutRegistryState,
  UseShortcutRegistryReturn,
  ShortcutConflict,
  ShortcutScope,
  ShortcutKey,
  ShortcutFormatOptions,
  ParsedShortcut,
  KeyboardEventMatch
} from '../types/shortcut.types'
import { detectConflicts } from '../utils/conflict-detector'
import { formatShortcut } from '../utils/key-formatter'
import { parseShortcut, matchesShortcut } from '../utils/key-parser'
import { toast } from 'sonner'

/**
 * 快捷键注册表管理 Hook
 */
export function useShortcutRegistry(scope?: string): UseShortcutRegistryReturn {
  const [state, setState] = useState<ShortcutRegistryState>({
    registrations: new Map(),
    conflicts: [],
    activeScope: scope || null
  })

  const keyboardListenerRef = useRef<((event: KeyboardEvent) => void) | null>(null)
  const stateRef = useRef(state)

  // 保持 stateRef 与 state 同步
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // 注册快捷键
  const register = useCallback((registration: ShortcutRegistration) => {
    setState((prevState) => {
      const newRegistrations = new Map(prevState.registrations)
      newRegistrations.set(registration.id, registration)

      // 检测冲突
      const allRegistrations = Array.from(newRegistrations.values())
      const conflicts = detectConflicts(allRegistrations)

      return {
        ...prevState,
        registrations: newRegistrations,
        conflicts
      }
    })
  }, [])

  // 注销快捷键
  const unregister = useCallback((id: string) => {
    setState((prevState) => {
      const newRegistrations = new Map(prevState.registrations)
      newRegistrations.delete(id)

      // 重新检测冲突
      const allRegistrations = Array.from(newRegistrations.values())
      const conflicts = detectConflicts(allRegistrations)

      return {
        ...prevState,
        registrations: newRegistrations,
        conflicts
      }
    })
  }, [])

  // 更新快捷键注册
  const updateRegistration = useCallback((id: string, updates: Partial<ShortcutRegistration>) => {
    setState((prevState) => {
      const newRegistrations = new Map(prevState.registrations)
      const existing = newRegistrations.get(id)

      if (existing) {
        newRegistrations.set(id, { ...existing, ...updates })

        // 重新检测冲突
        const allRegistrations = Array.from(newRegistrations.values())
        const conflicts = detectConflicts(allRegistrations)

        return {
          ...prevState,
          registrations: newRegistrations,
          conflicts
        }
      }

      return prevState
    })
  }, [])

  // 检查冲突
  const checkConflicts = useCallback((): ShortcutConflict[] => {
    const allRegistrations = Array.from(state.registrations.values())
    return detectConflicts(allRegistrations)
  }, [state.registrations])

  // 根据作用域获取注册
  const getRegistrationsByScope = useCallback(
    (scope: ShortcutScope): ShortcutRegistration[] => {
      return Array.from(state.registrations.values()).filter((reg) => reg.scope === scope)
    },
    [state.registrations]
  )

  // 设置活动作用域
  const setActiveScope = useCallback((scope: string | null) => {
    setState((prevState) => ({
      ...prevState,
      activeScope: scope
    }))
  }, [])

  // 格式化快捷键
  const formatShortcutCallback = useCallback(
    (keys: ShortcutKey[], options?: ShortcutFormatOptions): string => {
      return formatShortcut(keys, options)
    },
    []
  )

  // 解析快捷键
  const parseShortcutCallback = useCallback((keys: ShortcutKey[]): ParsedShortcut => {
    return parseShortcut(keys)
  }, [])

  // 匹配键盘事件
  const matchKeyboardEvent = useCallback(
    (event: KeyboardEvent): KeyboardEventMatch => {
      const allRegistrations = Array.from(state.registrations.values())

      // 优先匹配当前作用域的快捷键
      const scopedRegistrations = state.activeScope
        ? allRegistrations.filter((reg) => reg.scope === 'page' || reg.scope === 'global')
        : allRegistrations.filter((reg) => reg.scope === 'global')

      // 按优先级排序
      const sortedRegistrations = scopedRegistrations.sort((a, b) => b.priority - a.priority)

      for (const registration of sortedRegistrations) {
        if (registration.enabled && matchesShortcut(event, registration.keys)) {
          // 检查条件
          if (registration.condition && !registration.condition()) {
            continue
          }

          return {
            matches: true,
            registration,
            event
          }
        }
      }

      return {
        matches: false,
        event
      }
    },
    [state.registrations, state.activeScope]
  )

  // 移除未使用的 handleKeyboardEvent 函数

  // 设置键盘监听器
  useEffect(() => {
    const currentHandler = (event: KeyboardEvent) => {
      // 使用 ref 访问最新的状态，避免闭包问题
      const currentState = stateRef.current
      const allRegistrations = Array.from(currentState.registrations.values())

      // 优先匹配当前作用域的快捷键
      const scopedRegistrations = currentState.activeScope
        ? allRegistrations.filter((reg) => reg.scope === 'page' || reg.scope === 'global')
        : allRegistrations.filter((reg) => reg.scope === 'global')

      // 按优先级排序
      const sortedRegistrations = scopedRegistrations.sort((a, b) => b.priority - a.priority)

      for (const registration of sortedRegistrations) {
        if (registration.enabled && matchesShortcut(event, registration.keys)) {
          // 检查条件
          if (registration.condition && !registration.condition()) {
            continue
          }

          event.preventDefault()
          event.stopPropagation()

          try {
            registration.action()
          } catch (error) {
            console.error('执行快捷键操作时出错:', error)
          }

          return
        }
      }
    }

    // 移除旧的监听器
    if (keyboardListenerRef.current) {
      window.removeEventListener('keydown', keyboardListenerRef.current)
    }

    // 添加新的监听器
    keyboardListenerRef.current = currentHandler
    window.addEventListener('keydown', currentHandler)

    return () => {
      if (keyboardListenerRef.current) {
        window.removeEventListener('keydown', keyboardListenerRef.current)
      }
    }
  }, []) // 空依赖数组，只在组件挂载时执行一次

  // 调试信息
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && state.conflicts.length > 0) {
      console.warn('快捷键冲突检测到:', state.conflicts)
      toast.warning(
        `检测到 ${state.conflicts.length} 个快捷键冲突: ${state.conflicts.map(getConflictDescription).join(', ')}`
      )
    }
  }, [state.conflicts])

  return {
    state,
    register,
    unregister,
    updateRegistration,
    checkConflicts,
    getRegistrationsByScope,
    setActiveScope,
    formatShortcut: formatShortcutCallback,
    parseShortcut: parseShortcutCallback,
    matchKeyboardEvent
  }
}
