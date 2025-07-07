/**
 * 统一快捷键管理系统 (重构版)
 *
 * 使用 zustand store 重构，解决 Hook 引用不稳定问题
 * 提供页面级和全局级的快捷键管理功能，支持：
 * - 快捷键包装器组件
 * - 自动 tooltip 提示
 * - 冲突检测和优先级管理
 * - macOS 风格快捷键显示
 * - 平台自适应
 * - 性能优化和稳定的状态管理
 */

// 主要组件
export { Shortcut, ShortcutDisplay } from './shortcut'
export { ShortcutProvider, useShortcuts, ShortcutDebugPanel } from './shortcut-provider'
export { ShortcutOverlay, useShortcutOverlay } from './shortcut-overlay'

// Store 和 Hooks
export {
  useShortcutStore,
  useShortcutPreferences,
  useShortcutConflicts,
  useShortcutDebugInfo
} from './stores/shortcut-store'

// 优化后的自定义 Hooks (遵循 React.dev 最佳实践)
export {
  useShortcutValidation,
  useChildComponentHandler,
  useShortcutRegistration,
  useTooltipContent,
  useShortcutRegistry
} from './hooks'

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
  ShortcutDisplayProps,
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

// Store 类型
export type {
  ShortcutStore,
  ShortcutStoreState,
  ShortcutStoreActions
} from './stores/shortcut-store'

// 优化后的 Hook 类型
export type {
  ValidationResult,
  ShortcutValidationConfig,
  ChildComponentHandlerResult,
  ShortcutRegistrationConfig,
  TooltipContentConfig
} from './hooks'
