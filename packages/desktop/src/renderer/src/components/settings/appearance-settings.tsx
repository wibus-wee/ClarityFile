'use client'

import { z } from 'zod'
import { useTranslation } from 'react-i18next'

import {
  SettingsForm,
  SettingsSection,
  SettingsSelectField,
  SettingsRadioField
} from './components'
import { CustomThemeSection } from './custom-theme-section'

const appearanceSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  fontFamily: z.string()
})

type AppearanceSettingsForm = z.infer<typeof appearanceSettingsSchema>

const defaultValues: AppearanceSettingsForm = {
  theme: 'system',
  fontFamily: 'system'
}

export function AppearanceSettings() {
  const { t } = useTranslation('settings')

  // 使用翻译创建选项数组
  const fontOptions = [
    { value: 'system', label: t('appearance.fonts.system') },
    { value: 'inter', label: t('appearance.fonts.inter') },
    { value: 'roboto', label: t('appearance.fonts.roboto') },
    { value: 'noto-sans', label: t('appearance.fonts.notoSans') },
    { value: 'source-han-sans', label: t('appearance.fonts.sourceHanSans') }
  ]

  const themeOptions = [
    {
      value: 'light',
      label: t('appearance.themes.light'),
      description: t('appearance.themes.lightDescription')
    },
    {
      value: 'dark',
      label: t('appearance.themes.dark'),
      description: t('appearance.themes.darkDescription')
    },
    {
      value: 'system',
      label: t('appearance.themes.system'),
      description: t('appearance.themes.systemDescription')
    }
  ]

  const mapFormDataToSettings = (data: AppearanceSettingsForm) => {
    return [
      {
        key: 'appearance.theme',
        value: data.theme,
        category: 'appearance',
        description: t('appearance.theme')
      },
      {
        key: 'appearance.fontFamily',
        value: data.fontFamily,
        category: 'appearance',
        description: t('appearance.fontFamily')
      }
    ]
  }

  return (
    <SettingsForm
      category="appearance"
      schema={appearanceSettingsSchema}
      defaultValues={defaultValues}
      mapFormDataToSettings={mapFormDataToSettings}
    >
      {(form) => (
        <>
          <SettingsSection
            title={t('appearance.basicThemeSettings')}
            description={t('appearance.basicThemeDescription')}
          >
            <div className="grid grid-cols-2 gap-4">
              <SettingsRadioField
                control={form.control}
                name="theme"
                label={t('appearance.theme')}
                options={themeOptions}
                orientation="horizontal"
              />
              <SettingsSelectField
                control={form.control}
                name="fontFamily"
                label={t('appearance.fontFamily')}
                description={t('appearance.fontFamilyDescription')}
                placeholder={t('appearance.selectFont')}
                options={fontOptions}
              />
            </div>
          </SettingsSection>

          {/* 自定义主题管理 */}
          <CustomThemeSection />
        </>
      )}
    </SettingsForm>
  )
}
