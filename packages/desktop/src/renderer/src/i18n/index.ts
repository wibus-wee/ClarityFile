import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// 导入翻译资源
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

// i18n 配置
i18n
  .use(initReactI18next) // 传递 i18n 实例给 react-i18next
  .init({
    // 默认语言
    lng: 'zh-CN',
    
    // 回退语言
    fallbackLng: 'zh-CN',
    
    // 调试模式（开发环境启用）
    debug: process.env.NODE_ENV === 'development',
    
    // 插值配置
    interpolation: {
      escapeValue: false, // React 已经默认转义
    },
    
    // 翻译资源
    resources: {
      'zh-CN': zhCN,
      'en-US': enUS,
    },
    
    // 命名空间配置
    defaultNS: 'common',
    ns: ['common', 'settings', 'navigation', 'projects', 'files', 'expenses', 'competitions'],
    
    // 键分隔符
    keySeparator: '.',
    
    // 命名空间分隔符
    nsSeparator: ':',
    
    // 检测选项
    detection: {
      // 存储用户语言偏好的键名
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    // React 特定配置
    react: {
      // 等待翻译加载完成
      useSuspense: false,
      // 绑定事件
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },
  })

export default i18n
