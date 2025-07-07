/**
 * Shortcuts Hooks 导出文件
 *
 * 这个文件导出所有快捷键相关的自定义 Hooks，
 * 遵循 React.dev 最佳实践的模块化设计
 */

// 快捷键验证 Hook
export { useShortcutValidation } from './use-shortcut-validation'
export type { ValidationResult, ShortcutValidationConfig } from './use-shortcut-validation'

// 子组件处理 Hook
export { useChildComponentHandler } from './use-child-component-handler'
export type { ChildComponentHandlerResult } from './use-child-component-handler'

// 快捷键注册 Hook
export { useShortcutRegistration } from './use-shortcut-registration'
export type { ShortcutRegistrationConfig } from './use-shortcut-registration'

// Tooltip 内容 Hook
export { useTooltipContent } from './use-tooltip-content'
export type { TooltipContentConfig } from './use-tooltip-content'
