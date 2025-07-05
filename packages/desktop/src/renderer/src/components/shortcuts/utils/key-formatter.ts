import type { ShortcutKey, ShortcutFormatOptions } from '../types/shortcut.types'
import { detectPlatform } from './platform-detector'

/**
 * 快捷键格式化工具
 */

// macOS 符号映射
const MACOS_SYMBOLS: Record<string, string> = {
  cmd: '⌘',
  meta: '⌘',
  ctrl: '⌃',
  shift: '⇧',
  alt: '⌥',
  option: '⌥',
  enter: '↩',
  escape: '⎋',
  space: '␣',
  tab: '⇥',
  backspace: '⌫',
  delete: '⌦',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  home: '↖',
  end: '↘',
  pageup: '⇞',
  pagedown: '⇟'
}

// Windows/Linux 符号映射
const WINDOWS_SYMBOLS: Record<string, string> = {
  cmd: 'Ctrl',
  meta: 'Win',
  ctrl: 'Ctrl',
  shift: 'Shift',
  alt: 'Alt',
  option: 'Alt',
  enter: 'Enter',
  escape: 'Esc',
  space: 'Space',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Delete',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  home: 'Home',
  end: 'End',
  pageup: 'PgUp',
  pagedown: 'PgDn'
}

// 修饰键顺序（用于排序）
const MODIFIER_ORDER: Record<string, number> = {
  ctrl: 1,
  cmd: 1,
  meta: 1,
  alt: 2,
  option: 2,
  shift: 3
}

/**
 * 格式化快捷键显示
 */
export function formatShortcut(keys: ShortcutKey[], options: ShortcutFormatOptions = {}): string {
  const {
    platform = detectPlatform(),
    separator = platform === 'macos' ? '' : '+',
    showSymbols = true
  } = options

  if (keys.length === 0) {
    return ''
  }

  // 选择符号映射
  const symbols = platform === 'macos' ? MACOS_SYMBOLS : WINDOWS_SYMBOLS

  // 分离修饰键和常规键
  const modifiers: string[] = []
  const regularKeys: string[] = []

  keys.forEach((key) => {
    const keyStr = key.toLowerCase()
    if (isModifierKey(keyStr)) {
      modifiers.push(keyStr)
    } else {
      regularKeys.push(keyStr)
    }
  })

  // 对修饰键排序
  modifiers.sort((a, b) => (MODIFIER_ORDER[a] || 999) - (MODIFIER_ORDER[b] || 999))

  // 格式化所有键
  const formattedKeys: string[] = []

  // 添加修饰键
  modifiers.forEach((modifier) => {
    if (showSymbols && symbols[modifier]) {
      formattedKeys.push(symbols[modifier])
    } else {
      formattedKeys.push(capitalizeFirst(modifier))
    }
  })

  // 添加常规键
  regularKeys.forEach((key) => {
    if (showSymbols && symbols[key]) {
      formattedKeys.push(symbols[key])
    } else {
      formattedKeys.push(formatRegularKey(key))
    }
  })

  return formattedKeys.join(separator)
}

/**
 * 检查是否为修饰键
 */
function isModifierKey(key: string): boolean {
  return ['cmd', 'ctrl', 'shift', 'alt', 'option', 'meta'].includes(key.toLowerCase())
}

/**
 * 格式化常规键
 */
function formatRegularKey(key: string): string {
  // 单字母键大写
  if (key.length === 1 && /[a-z]/.test(key)) {
    return key.toUpperCase()
  }

  // 数字键保持原样
  if (/^\d$/.test(key)) {
    return key
  }

  // F键大写
  if (/^f\d+$/.test(key)) {
    return key.toUpperCase()
  }

  // 其他键首字母大写
  return capitalizeFirst(key)
}

/**
 * 首字母大写
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 获取平台特定的快捷键格式
 */
export function getPlatformShortcutFormat(keys: ShortcutKey[]): string {
  const platform = detectPlatform()
  return formatShortcut(keys, { platform, showSymbols: true })
}

/**
 * 将 cmd 键转换为平台特定的键
 */
export function normalizeCmdKey(keys: ShortcutKey[]): ShortcutKey[] {
  const platform = detectPlatform()

  return keys.map((key) => {
    if (key === 'cmd') {
      return platform === 'macos' ? 'cmd' : 'ctrl'
    }
    return key
  })
}

/**
 * 检查快捷键是否有效
 */
export function isValidShortcut(keys: ShortcutKey[]): boolean {
  if (keys.length === 0) {
    return false
  }

  // 至少需要一个非修饰键
  const hasRegularKey = keys.some((key) => !isModifierKey(key))
  if (!hasRegularKey) {
    return false
  }

  // 检查重复键
  const uniqueKeys = new Set(keys.map((k) => k.toLowerCase()))
  if (uniqueKeys.size !== keys.length) {
    return false
  }

  return true
}

/**
 * 生成快捷键的唯一标识符
 */
export function generateShortcutId(keys: ShortcutKey[]): string {
  const normalizedKeys = normalizeCmdKey(keys)
  const sortedKeys = [...normalizedKeys].sort()
  return sortedKeys.join('+').toLowerCase()
}
