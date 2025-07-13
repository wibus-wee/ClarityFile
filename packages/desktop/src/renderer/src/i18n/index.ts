import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入翻译资源
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

// i18n 配置
i18n
  .use(LanguageDetector) // 使用语言检测插件
  .use(initReactI18next) // 传递 i18n 实例给 react-i18next
  .init({
    // 不设置 lng，让 LanguageDetector 自动检测
    // lng: 'zh-CN', // 移除这行，让检测器工作

    // 回退语言
    fallbackLng: 'zh-CN',

    // 调试模式（开发环境启用）
    debug: process.env.NODE_ENV === 'development',

    // 插值配置
    interpolation: {
      escapeValue: false // React 已经默认转义
    },

    // 翻译资源
    resources: {
      'zh-CN': zhCN,
      'en-US': enUS
    },

    // 命名空间配置
    defaultNS: 'common',
    ns: ['common', 'settings', 'navigation', 'projects', 'files', 'expenses', 'competitions'],

    // 键分隔符
    keySeparator: '.',

    // 命名空间分隔符
    nsSeparator: ':',

    // 语言检测配置
    detection: {
      // 检测顺序：localStorage -> navigator -> 默认语言
      order: ['localStorage', 'navigator'],

      // 缓存用户语言偏好
      caches: ['localStorage'],

      // localStorage 键名
      lookupLocalStorage: 'i18nextLng'
    },

    // React 特定配置
    react: {
      // 等待翻译加载完成
      useSuspense: false,
      // 绑定事件
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed'
    }
  })

export default i18n
