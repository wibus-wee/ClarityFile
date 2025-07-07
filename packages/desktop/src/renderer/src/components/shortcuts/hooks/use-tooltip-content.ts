import { useMemo } from 'react'
import type { ShortcutKey } from '../types/shortcut.types'
import { useShortcutStore } from '../stores/shortcut-store'

/**
 * Tooltip 内容配置
 */
export interface TooltipContentConfig {
  shortcut: ShortcutKey[]
  description?: string
  customContent?: string
  showTooltip: boolean
}

/**
 * Tooltip 内容 Hook
 * 
 * 职责：
 * - 生成格式化的 tooltip 内容
 * - 处理用户偏好设置
 * - 优化内容计算性能
 * 
 * 这个 Hook 遵循 React.dev 最佳实践：
 * - 使用 useMemo 优化计算
 * - 单一职责：只处理 tooltip 内容
 * - 清晰的依赖数组
 */
export function useTooltipContent(config: TooltipContentConfig): {
  shouldShowTooltip: boolean
  tooltipContent: string
} {
  const formatShortcut = useShortcutStore((state) => state.formatShortcut)
  const userPreferences = useShortcutStore((state) => state.userPreferences)

  // 格式化快捷键显示
  const formattedShortcut = useMemo(() => {
    return formatShortcut(config.shortcut)
  }, [config.shortcut, formatShortcut])

  // 生成 tooltip 内容
  const tooltipContent = useMemo(() => {
    if (config.customContent) {
      return config.customContent
    }

    const parts: string[] = []
    if (config.description) {
      parts.push(config.description)
    }
    if (formattedShortcut) {
      parts.push(`(${formattedShortcut})`)
    }

    return parts.join(' ')
  }, [config.customContent, config.description, formattedShortcut])

  // 判断是否应该显示 tooltip
  const shouldShowTooltip = useMemo(() => {
    return (
      config.showTooltip &&
      userPreferences.enableTooltips &&
      Boolean(tooltipContent)
    )
  }, [config.showTooltip, userPreferences.enableTooltips, tooltipContent])

  return {
    shouldShowTooltip,
    tooltipContent
  }
}
