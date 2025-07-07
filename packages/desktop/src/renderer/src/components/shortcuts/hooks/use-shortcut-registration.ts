import { useEffect, useId } from 'react'
import type { ShortcutKey, ShortcutScope } from '../types/shortcut.types'
import type { ValidationResult } from './use-shortcut-validation'
import { useShortcutStore } from '../stores/shortcut-store'

/**
 * 快捷键注册配置
 */
export interface ShortcutRegistrationConfig {
  keys: ShortcutKey[]
  scope: ShortcutScope
  priority: number
  enabled: boolean
  description?: string
  condition?: () => boolean
  validation: ValidationResult
  actionRef: React.RefObject<(() => void) | null>
}

/**
 * 快捷键注册 Hook
 *
 * 职责：
 * - 处理快捷键的注册和注销
 * - 管理快捷键的生命周期
 * - 提供稳定的 action 函数引用
 *
 * 这个 Hook 遵循 React.dev 最佳实践：
 * - 单一职责：只处理注册逻辑
 * - 正确的依赖数组管理
 * - 清理函数处理副作用
 */
export function useShortcutRegistration(config: ShortcutRegistrationConfig): string {
  const id = useId()

  // 从 store 获取稳定的方法引用
  const register = useShortcutStore((state) => state.register)
  const unregister = useShortcutStore((state) => state.unregister)

  // 注册快捷键
  useEffect(() => {
    if (!config.validation.isValid) {
      return
    }

    // 创建稳定的 action 函数
    const stableAction = () => {
      if (config.actionRef.current) {
        try {
          config.actionRef.current()
        } catch (error) {
          console.error('执行快捷键操作时出错:', error)
        }
      }
    }

    const registration = {
      id,
      keys: config.keys,
      scope: config.scope,
      priority: config.priority,
      enabled: config.enabled && config.validation.isValid,
      description: config.description,
      action: stableAction,
      condition: config.condition
    }

    register(registration)

    return () => {
      unregister(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    id,
    config.keys,
    config.scope,
    config.priority,
    config.enabled,
    config.description,
    config.condition,
    config.validation.isValid,
    register,
    unregister
    // 注意：不包含 config.actionRef，因为它是 ref 对象，不会触发重新注册
  ])

  return id
}
