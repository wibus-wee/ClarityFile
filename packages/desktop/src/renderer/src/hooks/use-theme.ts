import { useCustomTheme } from '@renderer/providers/custom-theme-provider'
import type { Theme, ExtendedTheme } from '@renderer/types/theme'

export { type Theme, type ExtendedTheme }

export function useTheme() {
  const {
    theme,
    resolvedTheme,
    systemTheme,
    setTheme,
    toggleTheme,
    isLoading,
    customThemes,
    activeCustomTheme,
    applyCustomTheme,
    removeCustomTheme,
    saveCustomTheme,
    updateCustomTheme,
    previewTheme,
    clearPreview,
    switchToDefaultTheme
  } = useCustomTheme()

  return {
    // 基础主题功能
    theme, // 当前设置的主题
    currentTheme: resolvedTheme, // 实际应用的主题
    setTheme, // 设置主题
    toggleTheme, // 切换主题
    systemTheme, // 系统主题
    isLoading, // 加载状态

    // 自定义主题功能
    customThemes, // 所有自定义主题
    activeCustomTheme, // 当前激活的自定义主题 ID
    applyCustomTheme, // 应用自定义主题
    removeCustomTheme, // 删除自定义主题
    saveCustomTheme, // 保存自定义主题
    updateCustomTheme, // 更新自定义主题
    previewTheme, // 预览主题
    clearPreview, // 清除预览
    switchToDefaultTheme, // 切回默认主题

    // 便捷方法
    hasCustomTheme: activeCustomTheme !== null, // 是否有激活的自定义主题
    customThemeCount: customThemes.length // 自定义主题数量
  }
}
