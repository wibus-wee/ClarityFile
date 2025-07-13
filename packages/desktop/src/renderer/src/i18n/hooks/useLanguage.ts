import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { SupportedLanguage, UseLanguageReturn, LanguageConfig } from '../types'
import { SUPPORTED_LANGUAGES } from '../types'

/**
 * 语言管理 Hook
 * 提供语言切换和状态管理功能
 */
export function useLanguage(): UseLanguageReturn {
  const { i18n } = useTranslation()
  const [isChanging, setIsChanging] = useState(false)

  // 获取当前语言
  const currentLanguage = i18n.language as SupportedLanguage

  // 获取可用语言列表
  const availableLanguages: LanguageConfig[] = SUPPORTED_LANGUAGES

  // 切换语言
  const changeLanguage = useCallback(
    async (language: SupportedLanguage) => {
      if (language === currentLanguage || isChanging) {
        return
      }

      setIsChanging(true)

      try {
        await i18n.changeLanguage(language)

        // 保存到本地存储
        localStorage.setItem('i18nextLng', language)

        // 触发自定义事件，通知其他组件语言已更改
        window.dispatchEvent(
          new CustomEvent('languageChanged', {
            detail: {
              language,
              previousLanguage: currentLanguage
            }
          })
        )
      } catch (error) {
        console.error('Failed to change language:', error)
        throw error
      } finally {
        setIsChanging(false)
      }
    },
    [currentLanguage, i18n, isChanging]
  )

  return {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    isChanging
  }
}
