import { createContext, useContext, useEffect } from 'react'
import type { ShortcutProviderProps, UseShortcutRegistryReturn } from './types/shortcut.types'
import { useShortcutRegistry } from './hooks/use-shortcut-registry'

/**
 * 快捷键上下文
 */
const ShortcutContext = createContext<UseShortcutRegistryReturn | null>(null)

/**
 * 快捷键提供者组件
 * 为页面或组件树提供快捷键管理功能
 */
export function ShortcutProvider({ children, scope, debug = false }: ShortcutProviderProps) {
  const registry = useShortcutRegistry(scope)

  // 调试模式
  useEffect(() => {
    if (debug && process.env.NODE_ENV === 'development') {
      // 添加全局调试对象
      ;(window as any).__shortcutRegistry = registry

      console.log('快捷键调试模式已启用')
      console.log('使用 window.__shortcutRegistry 访问注册表')

      // 监听状态变化
      const logState = () => {
        console.group('快捷键注册表状态')
        console.log('作用域:', registry.state.activeScope)
        console.log('注册数量:', registry.state.registrations.size)
        console.log('冲突数量:', registry.state.conflicts.length)

        if (registry.state.conflicts.length > 0) {
          console.warn('检测到冲突:', registry.state.conflicts)
        }

        console.groupEnd()
      }

      logState()
    }
  }, [debug]) // 移除 registry 依赖，避免无限循环

  // 设置活动作用域
  useEffect(() => {
    if (scope) {
      registry.setActiveScope(scope)
    }

    return () => {
      // 清理时重置作用域
      registry.setActiveScope(null)
    }
  }, [scope]) // 移除 registry 依赖，因为 registry 对象每次都变化

  return <ShortcutContext.Provider value={registry}>{children}</ShortcutContext.Provider>
}

/**
 * 使用快捷键注册表的 Hook
 */
export function useShortcuts(): UseShortcutRegistryReturn {
  const context = useContext(ShortcutContext)

  if (!context) {
    throw new Error('useShortcuts 必须在 ShortcutProvider 内部使用')
  }

  return context
}

/**
 * 快捷键调试组件
 * 仅在开发环境下显示
 */
export function ShortcutDebugPanel() {
  const registry = useShortcuts()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const registrations = Array.from(registry.state.registrations.values())
  const conflicts = registry.state.conflicts

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 9999,
        fontFamily: 'monospace'
      }}
    >
      <h4>快捷键调试面板</h4>
      <div>作用域: {registry.state.activeScope || '全局'}</div>
      <div>注册数量: {registrations.length}</div>
      <div>冲突数量: {conflicts.length}</div>

      {conflicts.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>冲突:</strong>
          {conflicts.map((conflict, index) => (
            <div key={index} style={{ color: 'red', fontSize: '10px' }}>
              {registry.formatShortcut(conflict.keys)} - {conflict.registrations.length} 个冲突
            </div>
          ))}
        </div>
      )}

      <details style={{ marginTop: '10px' }}>
        <summary>所有注册 ({registrations.length})</summary>
        {registrations.map((reg) => (
          <div key={reg.id} style={{ fontSize: '10px', marginLeft: '10px' }}>
            <div>
              <strong>{registry.formatShortcut(reg.keys)}</strong>
              {!reg.enabled && <span style={{ color: 'gray' }}> (禁用)</span>}
            </div>
            <div style={{ color: 'gray' }}>
              {reg.description || reg.id} | {reg.scope} | 优先级: {reg.priority}
            </div>
          </div>
        ))}
      </details>
    </div>
  )
}
