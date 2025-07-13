// 支持的语言类型
export const SUPPORTED_LANGUAGES = ['zh-CN', 'en-US'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// 所有 i18n 命名空间
export const NAMESPACES = [
  'common',
  'competitions',
  'dashboard',
  'expenses',
  'files',
  'navigation',
  'projects',
  'settings'
] as const
export type Namespace = (typeof NAMESPACES)[number]

// 默认命名空间
export const DEFAULT_NS: Namespace = 'common'

// 语言配置接口
export interface LanguageConfig {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
}

// 语言管理 Hook 返回类型
export interface UseLanguageReturn {
  currentLanguage: SupportedLanguage
  availableLanguages: LanguageConfig[]
  isChanging: boolean
  changeLanguage: (language: SupportedLanguage) => Promise<void>
  getLanguageName: (language: SupportedLanguage) => string
  getNativeLanguageName: (language: SupportedLanguage) => string
}

// 支持的语言列表
export const LANGUAGES_CONFIG: LanguageConfig[] = [
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳'
  },
  {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English',
    flag: '🇺🇸'
  }
]
