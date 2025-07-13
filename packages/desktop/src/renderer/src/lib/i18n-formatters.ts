/**
 * 国际化格式化工具
 * 提供支持多语言的日期、时间、货币等格式化功能
 */

import type { SupportedLanguage } from '@renderer/i18n/types'

/**
 * 获取当前语言设置
 */
function getCurrentLanguage(): SupportedLanguage {
  // 从 localStorage 或其他地方获取当前语言设置
  const savedLanguage = localStorage.getItem('i18nextLng') as SupportedLanguage
  return savedLanguage || 'zh-CN'
}

/**
 * 获取语言对应的 locale 代码
 */
function getLocaleCode(language: SupportedLanguage): string {
  const localeMap: Record<SupportedLanguage, string> = {
    'zh-CN': 'zh-CN',
    'en-US': 'en-US'
  }
  return localeMap[language] || 'zh-CN'
}

/**
 * 国际化的相对时间格式化
 */
export function formatRelativeTime(dateString: string, language?: SupportedLanguage): string {
  const currentLang = language || getCurrentLanguage()
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  // 中文相对时间文本
  const zhTexts = {
    justNow: '刚刚',
    minutesAgo: (n: number) => `${n}分钟前`,
    hoursAgo: (n: number) => `${n}小时前`,
    daysAgo: (n: number) => `${n}天前`,
    weeksAgo: (n: number) => `${n}周前`,
    monthsAgo: (n: number) => `${n}个月前`,
    yearsAgo: (n: number) => `${n}年前`
  }

  // 英文相对时间文本
  const enTexts = {
    justNow: 'just now',
    minutesAgo: (n: number) => `${n} minute${n > 1 ? 's' : ''} ago`,
    hoursAgo: (n: number) => `${n} hour${n > 1 ? 's' : ''} ago`,
    daysAgo: (n: number) => `${n} day${n > 1 ? 's' : ''} ago`,
    weeksAgo: (n: number) => `${n} week${n > 1 ? 's' : ''} ago`,
    monthsAgo: (n: number) => `${n} month${n > 1 ? 's' : ''} ago`,
    yearsAgo: (n: number) => `${n} year${n > 1 ? 's' : ''} ago`
  }

  const texts = currentLang === 'zh-CN' ? zhTexts : enTexts

  if (diffInSeconds < 60) {
    return texts.justNow
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return texts.minutesAgo(diffInMinutes)
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return texts.hoursAgo(diffInHours)
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return texts.daysAgo(diffInDays)
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return texts.weeksAgo(diffInWeeks)
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return texts.monthsAgo(diffInMonths)
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return texts.yearsAgo(diffInYears)
}

/**
 * 国际化的友好日期格式化
 */
export function formatFriendlyDate(dateString: string, language?: SupportedLanguage): string {
  const currentLang = language || getCurrentLanguage()
  const locale = getLocaleCode(currentLang)
  const date = new Date(dateString)
  const now = new Date()

  // 如果是今天，显示相对时间
  if (date.toDateString() === now.toDateString()) {
    return formatRelativeTime(dateString, currentLang)
  }

  // 如果是今年，显示月日
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric'
    })
  }

  // 其他情况显示年月日
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * 国际化的完整日期格式化
 */
export function formatFullDate(dateString: string, language?: SupportedLanguage): string {
  const currentLang = language || getCurrentLanguage()
  const locale = getLocaleCode(currentLang)
  const date = new Date(dateString)

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

/**
 * 国际化的时间格式化
 */
export function formatTime(dateString: string, language?: SupportedLanguage): string {
  const currentLang = language || getCurrentLanguage()
  const locale = getLocaleCode(currentLang)
  const date = new Date(dateString)

  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 国际化的日期时间格式化
 */
export function formatDateTime(dateString: string, language?: SupportedLanguage): string {
  const currentLang = language || getCurrentLanguage()
  const locale = getLocaleCode(currentLang)
  const date = new Date(dateString)

  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 国际化的货币格式化
 */
export function formatCurrency(
  amount: number,
  currency: string = 'CNY',
  language?: SupportedLanguage
): string {
  const currentLang = language || getCurrentLanguage()
  const locale = getLocaleCode(currentLang)

  // 根据语言选择默认货币
  const defaultCurrency = currentLang === 'zh-CN' ? 'CNY' : 'USD'
  const finalCurrency = currency || defaultCurrency

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: finalCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * 国际化的数字格式化
 */
export function formatNumber(
  number: number,
  options?: Intl.NumberFormatOptions,
  language?: SupportedLanguage
): string {
  const currentLang = language || getCurrentLanguage()
  const locale = getLocaleCode(currentLang)

  return new Intl.NumberFormat(locale, options).format(number)
}

/**
 * 获取日期格式选项（用于设置页面）
 */
export function getDateFormatOptions(language?: SupportedLanguage) {
  const currentLang = language || getCurrentLanguage()

  if (currentLang === 'zh-CN') {
    return [
      { value: 'YYYY-MM-DD', label: '2024-12-07 (ISO)' },
      { value: 'YYYY年MM月DD日', label: '2024年12月07日 (中文)' },
      { value: 'DD/MM/YYYY', label: '07/12/2024 (欧洲)' },
      { value: 'MM/DD/YYYY', label: '12/07/2024 (美国)' }
    ]
  } else {
    return [
      { value: 'MM/DD/YYYY', label: '12/07/2024 (US)' },
      { value: 'DD/MM/YYYY', label: '07/12/2024 (European)' },
      { value: 'YYYY-MM-DD', label: '2024-12-07 (ISO)' },
      { value: 'YYYY年MM月DD日', label: '2024年12月07日 (Chinese)' }
    ]
  }
}

/**
 * 获取时间格式选项（用于设置页面）
 */
export function getTimeFormatOptions(language?: SupportedLanguage) {
  const currentLang = language || getCurrentLanguage()

  if (currentLang === 'zh-CN') {
    return [
      { value: '24h', label: '24小时制 (14:30)' },
      { value: '12h', label: '12小时制 (2:30 PM)' }
    ]
  } else {
    return [
      { value: '12h', label: '12-hour (2:30 PM)' },
      { value: '24h', label: '24-hour (14:30)' }
    ]
  }
}
