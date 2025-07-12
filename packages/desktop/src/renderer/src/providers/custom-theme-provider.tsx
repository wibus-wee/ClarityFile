'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  PropsWithChildren
} from 'react'
import type {
  Theme,
  ResolvedTheme,
  ExtendedThemeContextValue,
  CustomTheme
} from '@renderer/types/theme'
import { useSettingsByCategory, useSetSetting } from '@renderer/hooks/use-tipc'
import { CustomThemeManager } from '@renderer/lib/custom-theme-manager'
import { ThemeService } from '@renderer/lib/theme-service'

const ThemeContext = createContext<ExtendedThemeContextValue | undefined>(undefined)

export function CustomThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light')
  const [isLoading, setIsLoading] = useState(true)

  // 自定义主题状态
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([])
  const [activeCustomTheme, setActiveCustomTheme] = useState<string | null>(null)

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

  // 初始化自定义主题管理器
  useEffect(() => {
    CustomThemeManager.initialize()
    return () => {
      CustomThemeManager.destroy()
    }
  }, [])

  // 加载自定义主题数据
  useEffect(() => {
    const loadCustomThemes = async () => {
      try {
        const themes = await ThemeService.getCustomThemes()
        setCustomThemes(themes)

        const activeThemeId = await ThemeService.getActiveCustomTheme()
        setActiveCustomTheme(activeThemeId)
      } catch (error) {
        console.error('Failed to load custom themes:', error)
      }
    }

    if (!settingsLoading) {
      loadCustomThemes()
    }
  }, [settingsLoading])

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

  // 应用主题变化（包括自定义主题）
  useEffect(() => {
    if (!isLoading) {
      // 如果有激活的自定义主题，应用自定义主题 CSS
      if (activeCustomTheme) {
        const customTheme = customThemes.find((t) => t.id === activeCustomTheme)
        if (customTheme) {
          CustomThemeManager.applyCustomThemeCSS(customTheme.cssContent)
        } else {
          // 如果找不到自定义主题，清除激活状态并应用默认主题
          setActiveCustomTheme(null)
          ThemeService.setActiveCustomTheme(null).catch(console.error)
          CustomThemeManager.removeCustomThemeCSS()
        }
      } else {
        // 没有自定义主题时，移除自定义主题 CSS
        CustomThemeManager.removeCustomThemeCSS()
      }

      // 应用基础主题（light/dark 类名）
      applyTheme(resolvedTheme)
    }
  }, [resolvedTheme, isLoading, applyTheme, activeCustomTheme, customThemes])

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

  // 应用自定义主题
  const applyCustomTheme = useCallback(
    async (themeId: string) => {
      try {
        const theme = customThemes.find((t) => t.id === themeId)
        if (!theme) {
          throw new Error('主题不存在')
        }

        // 设置激活的自定义主题
        setActiveCustomTheme(themeId)
        await ThemeService.setActiveCustomTheme(themeId)

        // 清除基础主题设置，因为现在使用自定义主题
        setThemeState('system') // 设置为 system 作为默认值
        await setSetting({
          key: 'appearance.theme',
          value: 'system',
          category: 'appearance',
          description: '应用主题'
        })

        console.log('Custom theme applied:', themeId)
      } catch (error) {
        console.error('Failed to apply custom theme:', error)
        throw error
      }
    },
    [customThemes, setSetting]
  )

  // 移除自定义主题
  const removeCustomTheme = useCallback(
    async (themeId: string) => {
      try {
        await ThemeService.deleteCustomTheme(themeId)

        // 更新本地状态
        setCustomThemes((prev) => prev.filter((t) => t.id !== themeId))

        // 如果删除的是当前激活的主题，清除激活状态
        if (activeCustomTheme === themeId) {
          setActiveCustomTheme(null)
        }

        console.log('Custom theme removed:', themeId)
      } catch (error) {
        console.error('Failed to remove custom theme:', error)
        throw error
      }
    },
    [activeCustomTheme]
  )

  // 保存自定义主题
  const saveCustomTheme = useCallback(
    async (themeData: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newTheme = await ThemeService.saveCustomTheme(themeData)

        // 更新本地状态
        setCustomThemes((prev) => [...prev, newTheme])

        console.log('Custom theme saved:', newTheme.id)
        return newTheme
      } catch (error) {
        console.error('Failed to save custom theme:', error)
        throw error
      }
    },
    []
  )

  // 更新自定义主题
  const updateCustomTheme = useCallback(
    async (themeId: string, updates: Partial<Omit<CustomTheme, 'id' | 'createdAt'>>) => {
      try {
        const updatedTheme = await ThemeService.updateCustomTheme(themeId, updates)

        // 更新本地状态
        setCustomThemes((prev) =>
          prev.map((theme) => (theme.id === themeId ? updatedTheme : theme))
        )

        // 如果更新的是当前激活的主题，重新应用 CSS
        if (activeCustomTheme === themeId && updates.cssContent) {
          CustomThemeManager.applyCustomThemeCSS(updates.cssContent)
        }

        console.log('Custom theme updated:', themeId)
        return updatedTheme
      } catch (error) {
        console.error('Failed to update custom theme:', error)
        throw error
      }
    },
    [activeCustomTheme]
  )

  // 预览主题
  const previewTheme = useCallback((cssContent: string) => {
    try {
      CustomThemeManager.previewThemeCSS(cssContent)
    } catch (error) {
      console.error('Failed to preview theme:', error)
      throw error
    }
  }, [])

  // 清除预览
  const clearPreview = useCallback(() => {
    try {
      CustomThemeManager.clearPreviewCSS()
    } catch (error) {
      console.error('Failed to clear preview:', error)
    }
  }, [])

  // 切回默认主题
  const switchToDefaultTheme = useCallback(async () => {
    try {
      // 清除自定义主题
      setActiveCustomTheme(null)
      await ThemeService.setActiveCustomTheme(null)

      // 移除自定义主题 CSS
      CustomThemeManager.removeCustomThemeCSS()

      console.log('Switched to default theme')
    } catch (error) {
      console.error('Failed to switch to default theme:', error)
      throw error
    }
  }, [])

  const value: ExtendedThemeContextValue = {
    theme,
    resolvedTheme,
    systemTheme,
    setTheme,
    toggleTheme,
    isLoading,
    // 自定义主题功能
    customThemes,
    activeCustomTheme,
    applyCustomTheme,
    removeCustomTheme,
    saveCustomTheme,
    updateCustomTheme,
    previewTheme,
    clearPreview,
    switchToDefaultTheme
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useCustomTheme(): ExtendedThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider')
  }
  return context
}
