/**
 * i18n Hooks 导出
 */

export { useLanguage } from './useLanguage'
export { useTypedTranslation } from './useTypedTranslation'

// 导出强类型版本作为默认的 useTranslation
export { useTranslation } from './useTypedTranslation'

// 重新导出 react-i18next 的其他 hooks
export { Trans, useTranslation as useI18nTranslation } from 'react-i18next'
