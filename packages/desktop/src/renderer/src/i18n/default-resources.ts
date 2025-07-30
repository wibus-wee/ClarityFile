/**
 * @file 默认加载的国际化资源
 * @description 为了优化应用的首屏加载时间，此文件定义了在应用初始化时需要同步加载的核心翻译资源。
 * 我们借鉴了 Folo 的性能优化策略，默认只加载中文和英文的核心部分。
 * 当用户切换到其他语言或需要非核心模块的翻译时，应用将通过 `loadLanguage` 函数动态异步加载对应的语言包。
 */

import common_zhCN from '../../../../../../locales/common/zh-CN.json'
import commandPalette_zhCN from '../../../../../../locales/command-palette/zh-CN.json'
import settings_zhCN from '../../../../../../locales/settings/zh-CN.json'
import navigation_zhCN from '../../../../../../locales/navigation/zh-CN.json'
import competitions_zhCN from '../../../../../../locales/competitions/zh-CN.json'
import dashboard_zhCN from '../../../../../../locales/dashboard/zh-CN.json'
import expenses_zhCN from '../../../../../../locales/expenses/zh-CN.json'
import files_zhCN from '../../../../../../locales/files/zh-CN.json'
import projects_zhCN from '../../../../../../locales/projects/zh-CN.json'

import common_enUS from '../../../../../../locales/common/en-US.json'
import commandPalette_enUS from '../../../../../../locales/command-palette/en-US.json'
import settings_enUS from '../../../../../../locales/settings/en-US.json'
import navigation_enUS from '../../../../../../locales/navigation/en-US.json'
import competitions_enUS from '../../../../../../locales/competitions/en-US.json'
import dashboard_enUS from '../../../../../../locales/dashboard/en-US.json'
import expenses_enUS from '../../../../../../locales/expenses/en-US.json'
import files_enUS from '../../../../../../locales/files/en-US.json'
import projects_enUS from '../../../../../../locales/projects/en-US.json'

export const defaultResources = {
  'zh-CN': {
    common: common_zhCN,
    'command-palette': commandPalette_zhCN,
    settings: settings_zhCN,
    navigation: navigation_zhCN,
    competitions: competitions_zhCN,
    dashboard: dashboard_zhCN,
    expenses: expenses_zhCN,
    files: files_zhCN,
    projects: projects_zhCN
  },
  'en-US': {
    common: common_enUS,
    'command-palette': commandPalette_enUS,
    settings: settings_enUS,
    navigation: navigation_enUS,
    competitions: competitions_enUS,
    dashboard: dashboard_enUS,
    expenses: expenses_enUS,
    files: files_enUS,
    projects: projects_enUS
  }
} as const
