import { ReactElement } from 'react'

/**
 * 快捷键管理系统类型定义
 */

// 修饰键类型
export type ModifierKey = 'cmd' | 'ctrl' | 'shift' | 'alt' | 'option' | 'meta'

// 常规按键类型
export type RegularKey =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'enter'
  | 'escape'
  | 'space'
  | 'tab'
  | 'backspace'
  | 'delete'
  | 'arrowup'
  | 'arrowdown'
  | 'arrowleft'
  | 'arrowright'
  | 'f1'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'f5'
  | 'f6'
  | 'f7'
  | 'f8'
  | 'f9'
  | 'f10'
  | 'f11'
  | 'f12'
  | 'home'
  | 'end'
  | 'pageup'
  | 'pagedown'
  | 'comma'
  | 'period'
  | 'slash'
  | 'semicolon'
  | 'quote'
  | 'bracket'
  | 'backslash'
  | 'minus'
  | 'equal'
  | 'grave'

// 快捷键组合类型
export type ShortcutKey = ModifierKey | RegularKey

// 快捷键作用域
export type ShortcutScope = 'page' | 'global'

// 平台类型
export type Platform = 'macos' | 'windows' | 'linux'

// 快捷键注册项
export interface ShortcutRegistration {
  id: string
  keys: ShortcutKey[]
  scope: ShortcutScope
  priority: number
  enabled: boolean
  description?: string
  action: () => void
  condition?: () => boolean
}

// 快捷键冲突信息
export interface ShortcutConflict {
  keys: ShortcutKey[]
  registrations: ShortcutRegistration[]
  scope: ShortcutScope
}

// Shortcut 组件 Props
export interface ShortcutProps {
  /** 快捷键组合 */
  shortcut: ShortcutKey[]
  /** 被包装的子组件 */
  children: ReactElement
  /** 是否启用快捷键 */
  enabled?: boolean
  /** 快捷键描述 */
  description?: string
  /** 作用域 */
  scope?: ShortcutScope
  /** 优先级（数字越大优先级越高） */
  priority?: number
  /** 是否显示 tooltip */
  showTooltip?: boolean
  /** 启用条件 */
  condition?: () => boolean
  /** 自定义 tooltip 内容 */
  tooltipContent?: string
}

// ShortcutProvider Props
export interface ShortcutProviderProps {
  children: React.ReactNode
  /** 作用域名称 */
  scope?: string
  /** 是否启用调试模式 */
  debug?: boolean
}

// 快捷键注册表状态
export interface ShortcutRegistryState {
  registrations: Map<string, ShortcutRegistration>
  conflicts: ShortcutConflict[]
  activeScope: string | null
}

// 快捷键注册表操作
export interface ShortcutRegistryActions {
  register: (registration: ShortcutRegistration) => void
  unregister: (id: string) => void
  updateRegistration: (id: string, updates: Partial<ShortcutRegistration>) => void
  checkConflicts: () => ShortcutConflict[]
  getRegistrationsByScope: (scope: ShortcutScope) => ShortcutRegistration[]
  setActiveScope: (scope: string | null) => void
}

// 快捷键格式化选项
export interface ShortcutFormatOptions {
  platform?: Platform
  separator?: string
  showSymbols?: boolean
}

// 快捷键解析结果
export interface ParsedShortcut {
  modifiers: ModifierKey[]
  key: RegularKey
  isValid: boolean
  error?: string
}

// 键盘事件匹配结果
export interface KeyboardEventMatch {
  matches: boolean
  registration?: ShortcutRegistration
  event: KeyboardEvent
}

// Hook 返回类型
export interface UseShortcutRegistryReturn extends ShortcutRegistryActions {
  state: ShortcutRegistryState
  formatShortcut: (keys: ShortcutKey[], options?: ShortcutFormatOptions) => string
  parseShortcut: (keys: ShortcutKey[]) => ParsedShortcut
  matchKeyboardEvent: (event: KeyboardEvent) => KeyboardEventMatch
}
