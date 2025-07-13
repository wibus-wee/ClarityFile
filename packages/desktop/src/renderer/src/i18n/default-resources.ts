/**
 * @file 默认加载的国际化资源
 * @description 为了优化应用的首屏加载时间，此文件定义了在应用初始化时需要同步加载的核心翻译资源。
 * 我们借鉴了 Folo 的性能优化策略，默认只加载中文和英文的核心部分。
 * 当用户切换到其他语言或需要非核心模块的翻译时，应用将通过 `loadLanguage` 函数动态异步加载对应的语言包。
 */

import common_zhCN from './locales/zh-CN/common.json'
import settings_zhCN from './locales/zh-CN/settings.json'
import navigation_zhCN from './locales/zh-CN/navigation.json'

import common_enUS from './locales/en-US/common.json'
import settings_enUS from './locales/en-US/settings.json'
import navigation_enUS from './locales/en-US/navigation.json'

export const defaultResources = {
  'zh-CN': {
    common: common_zhCN,
    settings: settings_zhCN,
    navigation: navigation_zhCN
  },
  'en-US': {
    common: common_enUS,
    settings: settings_enUS,
    navigation: navigation_enUS
  }
} as const
