import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type { ShortcutProviderProps } from './types/shortcut.types'
import { useShortcutStore, useShortcutConflicts } from './stores/shortcut-store'

/**
 * 快捷键提供者组件 (重构版)
 * 使用 zustand store 管理状态，解决 Hook 引用不稳定问题
 */
export function ShortcutProvider({ children, scope, debug = false }: ShortcutProviderProps) {
  const setActiveScope = useShortcutStore((state) => state.setActiveScope)
  const handleKeyboardEvent = useShortcutStore((state) => state.handleKeyboardEvent)
  const updateUserPreferences = useShortcutStore((state) => state.updateUserPreferences)
  const conflicts = useShortcutConflicts()

  // 使用 ref 存储键盘事件处理器，避免重复添加监听器
  const keyboardHandlerRef = useRef<((event: KeyboardEvent) => void) | null>(null)

  // 设置调试模式
  useEffect(() => {
    updateUserPreferences({ debugMode: debug })
  }, [debug, updateUserPreferences])

  // 设置活动作用域
  useEffect(() => {
    if (scope) {
      setActiveScope(scope)
    }

    return () => {
      setActiveScope(null)
    }
  }, [scope, setActiveScope])

  // 全局键盘事件监听 - 只在组件挂载时设置一次
  useEffect(() => {
    // 创建稳定的事件处理器
    const stableHandler = (event: KeyboardEvent) => {
      // 忽略在输入框中的按键
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return
      }

      // 处理快捷键
      handleKeyboardEvent(event)
    }

    // 移除旧的监听器
    if (keyboardHandlerRef.current) {
      window.removeEventListener('keydown', keyboardHandlerRef.current)
    }

    // 添加新的监听器
    keyboardHandlerRef.current = stableHandler
    window.addEventListener('keydown', stableHandler)

    return () => {
      if (keyboardHandlerRef.current) {
        window.removeEventListener('keydown', keyboardHandlerRef.current)
        keyboardHandlerRef.current = null
      }
    }
  }, [handleKeyboardEvent])

  // 冲突警告 - 只在开发环境显示
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && debug && conflicts.length > 0) {
      console.warn('快捷键冲突检测到:', conflicts)

      const conflictMessages = conflicts.map((conflict) => {
        const keyStr = conflict.keys.join('+')
        const registrationIds = conflict.registrations.map((reg) => reg.id).join(', ')
        return `${keyStr}: ${registrationIds}`
      })

      toast.warning(`检测到 ${conflicts.length} 个快捷键冲突`, {
        description: conflictMessages.join('\n'),
        duration: 5000
      })
    }
  }, [conflicts, debug])

  // 开发环境调试信息
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && debug) {
      // 将 store 暴露到全局，方便调试
      ;(window as any).__shortcutStore = useShortcutStore.getState()
      console.log('快捷键系统已启用调试模式')
    }
  }, [debug])

  return <>{children}</>
}

/**
 * 快捷键调试组件 (重构版)
 * 显示当前注册的快捷键和冲突信息
 */
export function ShortcutDebugPanel() {
  const debugInfo = useShortcutStore((state) => state.getDebugInfo())
  const conflicts = useShortcutConflicts()
  const registrations = useShortcutStore((state) => Array.from(state.registrations.values()))
  const activeScope = useShortcutStore((state) => state.activeScope)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-semibold mb-2">快捷键调试面板</h3>

      <div className="space-y-2 text-sm">
        <div>
          <strong>总注册数:</strong> {debugInfo.totalRegistrations}
        </div>

        <div>
          <strong>冲突数:</strong> {debugInfo.conflictCount}
        </div>

        <div>
          <strong>当前作用域:</strong> {activeScope || '无'}
        </div>

        <div>
          <strong>按作用域分布:</strong>
          <ul className="ml-4">
            {Object.entries(debugInfo.registrationsByScope).map(([scope, count]) => (
              <li key={scope}>
                {scope}: {count}
              </li>
            ))}
          </ul>
        </div>

        {conflicts.length > 0 && (
          <div>
            <strong className="text-red-500">冲突列表:</strong>
            <ul className="ml-4 text-red-500">
              {conflicts.map((conflict, index) => (
                <li key={index}>
                  {conflict.keys.join('+')} ({conflict.registrations.length} 个)
                </li>
              ))}
            </ul>
          </div>
        )}

        <details className="mt-2">
          <summary className="cursor-pointer font-medium">所有注册</summary>
          <div className="mt-2 max-h-40 overflow-y-auto">
            {registrations.map((reg) => (
              <div key={reg.id} className="text-xs border-b py-1">
                <div>
                  <strong>{reg.keys.join('+')}</strong>
                </div>
                <div>ID: {reg.id}</div>
                <div>作用域: {reg.scope}</div>
                <div>优先级: {reg.priority}</div>
                <div>启用: {reg.enabled ? '是' : '否'}</div>
                {reg.description && <div>描述: {reg.description}</div>}
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  )
}

/**
 * 兼容性 Hook - 保持原有 API
 * 现在直接使用 zustand store
 */
export function useShortcuts() {
  return useShortcutStore()
}
