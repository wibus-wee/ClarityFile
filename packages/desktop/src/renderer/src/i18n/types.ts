/**
 * i18n 类型定义
 * 提供完整的 TypeScript 类型支持
 */

// 支持的语言类型
export type SupportedLanguage = 'zh-CN' | 'en-US'

// 命名空间类型
export type Namespace = 
  | 'common'
  | 'settings' 
  | 'navigation'
  | 'projects'
  | 'files'
  | 'expenses'
  | 'competitions'

// 语言配置接口
export interface LanguageConfig {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag?: string
  rtl?: boolean
}

// 翻译键路径类型（用于类型安全的翻译键）
export type TranslationKey = string

// 翻译函数参数类型
export interface TranslationOptions {
  count?: number
  context?: string
  defaultValue?: string
  interpolation?: Record<string, any>
  ns?: Namespace
}

// 语言切换事件类型
export interface LanguageChangeEvent {
  language: SupportedLanguage
  previousLanguage: SupportedLanguage
}

// i18n Hook 返回类型
export interface UseTranslationReturn {
  t: (key: TranslationKey, options?: TranslationOptions) => string
  i18n: any
  ready: boolean
}

// 语言管理 Hook 返回类型
export interface UseLanguageReturn {
  currentLanguage: SupportedLanguage
  availableLanguages: LanguageConfig[]
  changeLanguage: (language: SupportedLanguage) => Promise<void>
  isChanging: boolean
}

// 支持的语言配置
export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳'
  },
  'en-US': {
    code: 'en-US', 
    name: 'English (US)',
    nativeName: 'English (US)',
    flag: '🇺🇸'
  }
}

// 默认语言
export const DEFAULT_LANGUAGE: SupportedLanguage = 'zh-CN'

// 本地存储键名
export const LANGUAGE_STORAGE_KEY = 'i18nextLng'
