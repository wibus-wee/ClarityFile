/**
 * 统一快捷键管理系统
 *
 * 提供页面级和全局级的快捷键管理功能，支持：
 * - 快捷键包装器组件
 * - 自动 tooltip 提示
 * - 冲突检测和优先级管理
 * - macOS 风格快捷键显示
 * - 平台自适应
 */

// 主要组件
export { Shortcut, ShortcutDisplay } from './shortcut'
export { ShortcutProvider, useShortcuts, ShortcutDebugPanel } from './shortcut-provider'

// Hooks
export { useShortcutRegistry } from './hooks/use-shortcut-registry'

// 工具函数
export {
  formatShortcut,
  getPlatformShortcutFormat,
  normalizeCmdKey,
  isValidShortcut,
  generateShortcutId
} from './utils/key-formatter'

export { parseShortcut, extractKeysFromEvent, matchesShortcut } from './utils/key-parser'

export {
  detectConflicts,
  checkShortcutConflict,
  resolveConflicts,
  getConflictDescription,
  isSystemReservedShortcut,
  validateShortcutRegistration
} from './utils/conflict-detector'

export {
  detectPlatform,
  isMacOS,
  isWindows,
  isLinux,
  getPlatformModifierKey
} from './utils/platform-detector'

// 类型定义
export type {
  ShortcutKey,
  ModifierKey,
  RegularKey,
  ShortcutScope,
  Platform,
  ShortcutProps,
  ShortcutProviderProps,
  ShortcutRegistration,
  ShortcutConflict,
  ShortcutRegistryState,
  ShortcutRegistryActions,
  UseShortcutRegistryReturn,
  ShortcutFormatOptions,
  ParsedShortcut,
  KeyboardEventMatch
} from './types/shortcut.types'
