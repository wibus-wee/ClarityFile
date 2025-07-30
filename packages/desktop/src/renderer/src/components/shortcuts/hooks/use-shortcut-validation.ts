import { useMemo, useEffect } from 'react'
import type { ShortcutKey, ShortcutScope } from '../types/shortcut.types'
import { validateShortcutRegistration } from '../utils/conflict-detector'

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 快捷键验证配置
 */
export interface ShortcutValidationConfig {
  keys: ShortcutKey[]
  scope: ShortcutScope
  priority: number
  enabled: boolean
  description?: string
  condition?: () => boolean
}

/**
 * 快捷键验证 Hook
 *
 * 职责：
 * - 验证快捷键配置的有效性
 * - 在开发环境中显示错误和警告
 * - 提供验证结果给其他组件使用
 */
export function useShortcutValidation(config: ShortcutValidationConfig): ValidationResult {
  // 使用 useMemo 缓存验证结果，避免不必要的重新计算
  const validation = useMemo(() => {
    return validateShortcutRegistration({
      keys: config.keys,
      scope: config.scope,
      priority: config.priority,
      enabled: config.enabled,
      description: config.description,
      action: () => {}, // 空操作函数，仅用于验证
      condition: config.condition
    })
  }, [
    config.keys,
    config.scope,
    config.priority,
    config.enabled,
    config.description,
    config.condition
  ])

  // 分离关注点：错误处理
  useEffect(() => {
    if (!validation.isValid && process.env.NODE_ENV === 'development') {
      console.error('快捷键验证失败:', validation.errors)
    }
  }, [validation.isValid, validation.errors])

  // 分离关注点：警告处理
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && validation.warnings.length > 0) {
      console.warn('快捷键验证警告:', validation.warnings)
    }
  }, [validation.warnings])

  return validation
}
