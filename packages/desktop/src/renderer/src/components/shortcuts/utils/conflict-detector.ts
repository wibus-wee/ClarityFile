import { toast } from 'sonner'
import type { ShortcutRegistration, ShortcutConflict, ShortcutScope } from '../types/shortcut.types'
import { generateShortcutId } from './key-formatter'

/**
 * 快捷键冲突检测工具
 */

/**
 * 检测快捷键冲突
 */
export function detectConflicts(registrations: ShortcutRegistration[]): ShortcutConflict[] {
  const conflicts: ShortcutConflict[] = []
  const keyGroups = new Map<string, ShortcutRegistration[]>()

  // 按快捷键组合分组
  registrations.forEach((registration) => {
    const keyId = generateShortcutId(registration.keys)
    const scopeKeyId = `${registration.scope}:${keyId}`

    if (!keyGroups.has(scopeKeyId)) {
      keyGroups.set(scopeKeyId, [])
    }
    keyGroups.get(scopeKeyId)!.push(registration)
  })

  // 检查每个组是否有冲突
  keyGroups.forEach((group, scopeKeyId) => {
    if (group.length > 1) {
      // 提取作用域和键
      const [scope] = scopeKeyId.split(':')
      const keys = group[0].keys // 所有注册项的键都相同

      conflicts.push({
        keys,
        registrations: group,
        scope: scope as ShortcutScope
      })
    }
  })

  return conflicts
}

/**
 * 检查特定快捷键是否与现有注册冲突
 */
export function checkShortcutConflict(
  newRegistration: Omit<ShortcutRegistration, 'id'>,
  existingRegistrations: ShortcutRegistration[]
): ShortcutConflict | null {
  const newKeyId = generateShortcutId(newRegistration.keys)

  // 查找相同作用域和快捷键的注册
  const conflictingRegistrations = existingRegistrations.filter((reg) => {
    const existingKeyId = generateShortcutId(reg.keys)
    return reg.scope === newRegistration.scope && existingKeyId === newKeyId
  })

  if (conflictingRegistrations.length > 0) {
    return {
      keys: newRegistration.keys,
      registrations: conflictingRegistrations,
      scope: newRegistration.scope
    }
  }

  return null
}

/**
 * 解决快捷键冲突（基于优先级）
 */
export function resolveConflicts(conflicts: ShortcutConflict[]): {
  resolved: ShortcutRegistration[]
  disabled: ShortcutRegistration[]
} {
  const resolved: ShortcutRegistration[] = []
  const disabled: ShortcutRegistration[] = []

  conflicts.forEach((conflict) => {
    // 按优先级排序（优先级高的在前）
    const sortedRegistrations = conflict.registrations.sort((a, b) => b.priority - a.priority)

    // 第一个（优先级最高的）保持启用
    if (sortedRegistrations.length > 0) {
      resolved.push(sortedRegistrations[0])

      // 其余的禁用
      for (let i = 1; i < sortedRegistrations.length; i++) {
        disabled.push({
          ...sortedRegistrations[i],
          enabled: false
        })
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '快捷键冲突解决:',
        conflict.keys,
        '保留:',
        sortedRegistrations[0].id,
        '禁用:',
        disabled.map((reg) => reg.id)
      )
    }
  })

  return { resolved, disabled }
}

/**
 * 获取快捷键冲突的描述信息
 */
export function getConflictDescription(conflict: ShortcutConflict): string {
  const keyString = conflict.keys.join('+')
  const descriptions = conflict.registrations.map((reg) => reg.description || reg.id).join(', ')

  return `快捷键 "${keyString}" 在 ${conflict.scope} 作用域中有冲突: ${descriptions}`
}

/**
 * 检查快捷键是否为系统保留
 */
export function isSystemReservedShortcut(keys: string[]): boolean {
  const keyString = keys.join('+').toLowerCase()

  // macOS 系统保留快捷键
  const macOSReserved = [
    'cmd+space', // Spotlight
    'cmd+tab', // 应用切换
    'cmd+`', // 窗口切换
    'cmd+q', // 退出应用
    'cmd+w', // 关闭窗口
    'cmd+m', // 最小化
    'cmd+h', // 隐藏应用
    'cmd+option+h', // 隐藏其他应用
    'cmd+shift+3', // 截屏
    'cmd+shift+4', // 区域截屏
    'cmd+shift+5', // 截屏工具
    'cmd+ctrl+space', // 表情符号
    'cmd+ctrl+f' // 全屏
  ]

  // Windows 系统保留快捷键
  const windowsReserved = [
    'ctrl+alt+delete', // 任务管理器
    'alt+tab', // 应用切换
    'alt+f4', // 关闭窗口
    'win+l', // 锁屏
    'win+d', // 显示桌面
    'win+r', // 运行对话框
    'ctrl+shift+esc', // 任务管理器
    'print' // 截屏
  ]

  // 检查是否为系统保留
  const platform =
    typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('mac')
      ? 'macos'
      : 'windows'
  const reservedShortcuts = platform === 'macos' ? macOSReserved : windowsReserved

  return reservedShortcuts.includes(keyString)
}

/**
 * 验证快捷键注册的有效性
 */
export function validateShortcutRegistration(registration: Omit<ShortcutRegistration, 'id'>): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // 检查快捷键是否为空
  if (!registration.keys || registration.keys.length === 0) {
    errors.push('快捷键不能为空')
  }

  // 检查是否包含非修饰键
  const modifierKeys = ['cmd', 'ctrl', 'shift', 'alt', 'option', 'meta']
  const hasNonModifier = registration.keys.some((key) => !modifierKeys.includes(key.toLowerCase()))
  if (!hasNonModifier) {
    errors.push('快捷键必须包含至少一个非修饰键')
  }

  // 检查优先级
  if (registration.priority < 0 || registration.priority > 100) {
    warnings.push('建议优先级设置在 0-100 之间')
  }

  // 检查是否为系统保留快捷键
  if (isSystemReservedShortcut(registration.keys)) {
    warnings.push('该快捷键可能与系统快捷键冲突')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
