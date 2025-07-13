'use client'

import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useSetSetting } from '@renderer/hooks/use-tipc'
import { useI18nStore } from '@renderer/i18n/store'
import { LANGUAGES_CONFIG, SupportedLanguage } from '@renderer/i18n/constants'
import {
  SettingsForm,
  SettingsSection,
  SettingsSwitchField,
  SettingsSelectField
} from './components'

const languageSettingsSchema = z.object({
  language: z.string(),
  autoDetectLanguage: z.boolean(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  numberFormat: z.string()
})

type LanguageSettingsForm = z.infer<typeof languageSettingsSchema>

// 动态默认值函数，从当前语言状态获取
function createDefaultValues(currentLanguage: string): LanguageSettingsForm {
  return {
    language: currentLanguage,
    autoDetectLanguage: false,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    numberFormat: currentLanguage
  }
}

const mapFormDataToSettings = (data: LanguageSettingsForm) => [
  {
    key: 'language.current',
    value: data.language,
    category: 'language',
    description: '当前语言设置'
  },
  {
    key: 'language.autoDetect',
    value: data.autoDetectLanguage,
    category: 'language',
    description: '自动检测系统语言'
  },
  {
    key: 'language.dateFormat',
    value: data.dateFormat,
    category: 'language',
    description: '日期格式'
  },
  {
    key: 'language.timeFormat',
    value: data.timeFormat,
    category: 'language',
    description: '时间格式'
  },
  {
    key: 'language.numberFormat',
    value: data.numberFormat,
    category: 'language',
    description: '数字格式'
  }
]

export function LanguageSettings() {
  const { t } = useTranslation(['settings'])
  const { language: currentLanguage, actions } = useI18nStore()
  const { trigger: setSetting } = useSetSetting()

  const languageOptions = LANGUAGES_CONFIG.map((lang) => ({
    value: lang.code,
    label: `${lang.flag} ${lang.nativeName}`
  }))

  // 使用当前语言创建默认值
  const defaultValues = createDefaultValues(currentLanguage)

  // 自定义提交处理函数，集成语言切换逻辑
  const handleSubmit = async (data: LanguageSettingsForm) => {
    try {
      // 如果语言发生变化，先切换语言
      if (data.language !== currentLanguage) {
        await actions.changeLanguage(data.language as SupportedLanguage)
      }

      // 然后保存所有设置到数据库
      const settingsToSave = mapFormDataToSettings(data)
      for (const setting of settingsToSave) {
        await setSetting(setting)
      }
    } catch (error) {
      console.error('保存语言设置失败:', error)
      throw error
    }
  }

  const dateFormatOptions = [
    { value: 'YYYY-MM-DD', label: '2024-12-07 (ISO)' },
    { value: 'DD/MM/YYYY', label: '07/12/2024 (欧洲)' },
    { value: 'MM/DD/YYYY', label: '12/07/2024 (美国)' },
    { value: 'YYYY年MM月DD日', label: '2024年12月07日 (中文)' }
  ]

  const timeFormatOptions = [
    { value: '24h', label: '24小时制 (14:30)' },
    { value: '12h', label: '12小时制 (2:30 PM)' }
  ]

  return (
    <SettingsForm
      category="language"
      schema={languageSettingsSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
    >
      {(form) => (
        <>
          <SettingsSection title={t('language.title')} description={t('descriptions.language')}>
            <SettingsSelectField
              control={form.control}
              name="language"
              label={t('language.currentLanguage')}
              description={t('language.selectLanguage')}
              placeholder={t('language.selectLanguage')}
              options={languageOptions}
            />

            <SettingsSwitchField
              control={form.control}
              name="autoDetectLanguage"
              label={t('language.autoDetectLanguage')}
              description={t('language.autoDetectLanguageDescription')}
              className="flex flex-row items-center justify-between py-2"
            />
          </SettingsSection>

          <SettingsSection
            title={t('language.regionFormat')}
            description={t('language.regionFormatDescription')}
          >
            <SettingsSelectField
              control={form.control}
              name="dateFormat"
              label={t('language.dateFormat')}
              description={t('language.selectDateFormat')}
              placeholder={t('language.selectDateFormat')}
              options={dateFormatOptions}
            />

            <SettingsSelectField
              control={form.control}
              name="timeFormat"
              label={t('language.timeFormat')}
              description={t('language.selectTimeFormat')}
              placeholder={t('language.selectTimeFormat')}
              options={timeFormatOptions}
            />
          </SettingsSection>
        </>
      )}
    </SettingsForm>
  )
}
