import { useCustomTheme } from '@renderer/providers/custom-theme-provider'

export type Theme = 'dark' | 'light' | 'system'

export function useTheme() {
  const { theme, resolvedTheme, systemTheme, setTheme, toggleTheme, isLoading } = useCustomTheme()

  return {
    theme, // 当前设置的主题
    currentTheme: resolvedTheme, // 实际应用的主题
    setTheme, // 设置主题
    toggleTheme, // 切换主题
    systemTheme, // 系统主题
    isLoading // 加载状态
  }
}
