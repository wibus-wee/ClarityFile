import type { ShortcutKey, ModifierKey, RegularKey, ParsedShortcut } from '../types/shortcut.types'
import { detectPlatform } from './platform-detector'

/**
 * 快捷键解析工具
 */

/**
 * 解析快捷键组合
 */
export function parseShortcut(keys: ShortcutKey[]): ParsedShortcut {
  if (keys.length === 0) {
    return {
      modifiers: [],
      key: 'a', // 默认值
      isValid: false,
      error: '快捷键不能为空'
    }
  }

  const modifiers: ModifierKey[] = []
  const regularKeys: RegularKey[] = []

  // 分离修饰键和常规键
  for (const key of keys) {
    const normalizedKey = key.toLowerCase()

    if (isModifierKey(normalizedKey)) {
      modifiers.push(normalizedKey as ModifierKey)
    } else if (isRegularKey(normalizedKey)) {
      regularKeys.push(normalizedKey as RegularKey)
    } else {
      return {
        modifiers: [],
        key: 'a',
        isValid: false,
        error: `无效的按键: ${key}`
      }
    }
  }

  // 验证快捷键组合
  if (regularKeys.length === 0) {
    return {
      modifiers,
      key: 'a',
      isValid: false,
      error: '快捷键必须包含至少一个非修饰键'
    }
  }

  if (regularKeys.length > 1) {
    return {
      modifiers,
      key: regularKeys[0],
      isValid: false,
      error: '快捷键只能包含一个非修饰键'
    }
  }

  // 检查重复的修饰键
  const uniqueModifiers = new Set(modifiers)
  if (uniqueModifiers.size !== modifiers.length) {
    return {
      modifiers,
      key: regularKeys[0],
      isValid: false,
      error: '快捷键包含重复的修饰键'
    }
  }

  return {
    modifiers,
    key: regularKeys[0],
    isValid: true
  }
}

/**
 * 检查是否为修饰键
 */
function isModifierKey(key: string): boolean {
  const modifierKeys: ModifierKey[] = ['cmd', 'ctrl', 'shift', 'alt', 'option', 'meta']
  return modifierKeys.includes(key as ModifierKey)
}

/**
 * 检查是否为常规键
 */
function isRegularKey(key: string): boolean {
  const regularKeys: RegularKey[] = [
    // 字母键
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    // 数字键
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    // 特殊键
    'enter',
    'escape',
    'space',
    'tab',
    'backspace',
    'delete',
    'arrowup',
    'arrowdown',
    'arrowleft',
    'arrowright',
    'f1',
    'f2',
    'f3',
    'f4',
    'f5',
    'f6',
    'f7',
    'f8',
    'f9',
    'f10',
    'f11',
    'f12',
    'home',
    'end',
    'pageup',
    'pagedown',
    'comma',
    'period',
    'slash',
    'semicolon',
    'quote',
    'bracket',
    'backslash',
    'minus',
    'equal',
    'grave'
  ]

  return regularKeys.includes(key as RegularKey)
}

/**
 * 从键盘事件中提取按键信息
 */
export function extractKeysFromEvent(event: KeyboardEvent): ShortcutKey[] {
  const keys: ShortcutKey[] = []

  // 添加修饰键
  if (event.ctrlKey) {
    keys.push('ctrl')
  }
  if (event.metaKey) {
    keys.push('cmd')
  }
  if (event.shiftKey) {
    keys.push('shift')
  }
  if (event.altKey) {
    keys.push('alt')
  }

  // 添加主键
  const mainKey = normalizeEventKey(event.key)
  if (mainKey && !isModifierKey(mainKey)) {
    keys.push(mainKey as ShortcutKey)
  }

  return keys
}

/**
 * 标准化事件键名
 */
function normalizeEventKey(key: string): string {
  const keyMap: Record<string, string> = {
    ' ': 'space',
    Enter: 'enter',
    Escape: 'escape',
    Tab: 'tab',
    Backspace: 'backspace',
    Delete: 'delete',
    ArrowUp: 'arrowup',
    ArrowDown: 'arrowdown',
    ArrowLeft: 'arrowleft',
    ArrowRight: 'arrowright',
    Home: 'home',
    End: 'end',
    PageUp: 'pageup',
    PageDown: 'pagedown',
    ',': 'comma',
    '.': 'period',
    '/': 'slash',
    ';': 'semicolon',
    "'": 'quote',
    '[': 'bracket',
    '\\': 'backslash',
    '-': 'minus',
    '=': 'equal',
    '`': 'grave'
  }

  // 使用映射表转换
  if (keyMap[key]) {
    return keyMap[key]
  }

  // F键处理
  if (/^F\d+$/.test(key)) {
    return key.toLowerCase()
  }

  // 字母和数字键直接转小写
  if (/^[a-zA-Z0-9]$/.test(key)) {
    return key.toLowerCase()
  }

  return key.toLowerCase()
}

/**
 * 检查键盘事件是否匹配快捷键
 */
export function matchesShortcut(event: KeyboardEvent, shortcutKeys: ShortcutKey[]): boolean {
  const eventKeys = extractKeysFromEvent(event)
  const parsedShortcut = parseShortcut(shortcutKeys)

  if (!parsedShortcut.isValid) {
    return false
  }

  // 检查修饰键
  const eventModifiers = eventKeys.filter((key) => isModifierKey(key)).sort()
  const shortcutModifiers = parsedShortcut.modifiers.slice().sort()

  if (eventModifiers.length !== shortcutModifiers.length) {
    return false
  }

  for (let i = 0; i < eventModifiers.length; i++) {
    if (normalizeModifierKey(eventModifiers[i]) !== normalizeModifierKey(shortcutModifiers[i])) {
      return false
    }
  }

  // 检查主键
  const eventMainKey = eventKeys.find((key) => !isModifierKey(key))
  if (eventMainKey !== parsedShortcut.key) {
    return false
  }

  return true
}

/**
 * 标准化修饰键（处理 cmd/meta 的平台差异）
 */
function normalizeModifierKey(key: string): string {
  const platform = detectPlatform()

  if (key === 'cmd' || key === 'meta') {
    return platform === 'macos' ? 'cmd' : 'ctrl'
  }

  return key
}
