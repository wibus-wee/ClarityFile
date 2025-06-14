'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  PropsWithChildren
} from 'react'
import type { Theme, ResolvedTheme, ThemeContextValue } from '@renderer/types/theme'
import { useSettingsByCategory, useSetSetting } from '@renderer/hooks/use-tipc'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function CustomThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light')
  const [isLoading, setIsLoading] = useState(true)

  const { data: settings, isLoading: settingsLoading } = useSettingsByCategory('appearance')
  const { trigger: setSetting } = useSetSetting()

  // 计算实际应用的主题
  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme

  // 系统主题检测
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    // 初始化系统主题
    updateSystemTheme()

    // 监听系统主题变化
    mediaQuery.addEventListener('change', updateSystemTheme)

    return () => mediaQuery.removeEventListener('change', updateSystemTheme)
  }, [])

  // 应用主题到DOM
  const applyTheme = useCallback((themeToApply: ResolvedTheme) => {
    const root = document.documentElement

    // 移除所有主题类
    root.classList.remove('light', 'dark')

    // 添加新主题类
    root.classList.add(themeToApply)

    // 设置data属性（兼容某些组件库）
    root.setAttribute('data-theme', themeToApply)
  }, [])

  // 从数据库加载初始主题
  useEffect(() => {
    if (!settingsLoading && settings) {
      const themeSettings = settings.find((s) => s.key === 'appearance.theme')
      if (themeSettings) {
        try {
          const savedTheme = JSON.parse(themeSettings.value as string) as Theme
          setThemeState(savedTheme)
        } catch (error) {
          console.warn('Failed to parse theme setting:', error)
          setThemeState('system')
        }
      }
      setIsLoading(false)
    } else if (!settingsLoading) {
      // 没有设置数据时，使用默认主题
      setIsLoading(false)
    }
  }, [settings, settingsLoading])

  // 应用主题变化
  useEffect(() => {
    if (!isLoading) {
      applyTheme(resolvedTheme)
    }
  }, [resolvedTheme, isLoading, applyTheme])

  // 设置主题
  const setTheme = useCallback(
    async (newTheme: Theme) => {
      setThemeState(newTheme)

      try {
        // 同步到数据库
        await setSetting({
          key: 'appearance.theme',
          value: newTheme,
          category: 'appearance',
          description: '应用主题'
        })
      } catch (error) {
        console.error('Failed to save theme setting:', error)
      }
    },
    [setSetting]
  )

  // 切换主题
  const toggleTheme = useCallback(() => {
    if (resolvedTheme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }, [resolvedTheme, setTheme])

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    systemTheme,
    setTheme,
    toggleTheme,
    isLoading
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useCustomTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider')
  }
  return context
}
