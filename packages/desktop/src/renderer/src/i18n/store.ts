import { create } from 'zustand'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import { SupportedLanguage, DEFAULT_NS, NAMESPACES, SUPPORTED_LANGUAGES } from './constants'
import { defaultResources } from './default-resources'
import { loadLanguage } from './load-language'

interface I18nState {
  isInitialized: boolean
  language: SupportedLanguage
  actions: {
    initialize: (initialLang: SupportedLanguage) => Promise<void>
    changeLanguage: (lang: SupportedLanguage) => Promise<void>
  }
}

export const useI18nStore = create<I18nState>((set, get) => ({
  isInitialized: false,
  language: 'zh-CN', // 初始默认值
  actions: {
    initialize: async (initialLang) => {
      if (get().isInitialized) return

      await i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          resources: defaultResources,
          lng: initialLang,
          fallbackLng: 'zh-CN',
          supportedLngs: SUPPORTED_LANGUAGES,
          ns: NAMESPACES,
          defaultNS: DEFAULT_NS,
          debug: import.meta.env.DEV,
          interpolation: { escapeValue: false },
          detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng'
          },
          react: { useSuspense: false }
        })

      set({ isInitialized: true, language: i18n.language as SupportedLanguage })

      i18n.on('languageChanged', (lng) => {
        set({ language: lng as SupportedLanguage })
      })
    },
    changeLanguage: async (lang) => {
      if (!get().isInitialized) {
        console.error('[i18n] Store not initialized. Cannot change language.')
        return
      }
      await loadLanguage(lang)
      i18n.changeLanguage(lang)
    }
  }
}))
