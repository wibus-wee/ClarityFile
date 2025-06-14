'use client'

import { z } from 'zod'

import {
  SettingsForm,
  SettingsSection,
  SettingsSelectField,
  SettingsRadioField
} from './components'

const appearanceSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  fontFamily: z.string()
})

type AppearanceSettingsForm = z.infer<typeof appearanceSettingsSchema>

const defaultValues: AppearanceSettingsForm = {
  theme: 'system',
  fontFamily: 'system'
}

const fontOptions = [
  { value: 'system', label: '系统默认' },
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'noto-sans', label: 'Noto Sans' },
  { value: 'source-han-sans', label: '思源黑体' }
]

const themeOptions = [
  { value: 'light', label: '浅色', description: '明亮的界面主题' },
  { value: 'dark', label: '深色', description: '深色的界面主题' },
  { value: 'system', label: '跟随系统', description: '根据系统设置自动切换' }
]

export function AppearanceSettings() {
  const mapFormDataToSettings = (data: AppearanceSettingsForm) => {
    return [
      {
        key: 'appearance.theme',
        value: data.theme,
        category: 'appearance',
        description: '应用主题'
      },
      {
        key: 'appearance.fontFamily',
        value: data.fontFamily,
        category: 'appearance',
        description: '字体系列'
      }
    ]
  }

  return (
    <SettingsForm
      category="appearance"
      schema={appearanceSettingsSchema}
      defaultValues={defaultValues}
      mapFormDataToSettings={mapFormDataToSettings}
      submitButtonText="保存设置"
    >
      {(form) => (
        <>
          <SettingsSection title="主题设置" description="选择应用程序的外观主题">
            <div className="grid grid-cols-2 gap-4">
              <SettingsRadioField
                control={form.control}
                name="theme"
                label="主题模式"
                options={themeOptions}
                orientation="horizontal"
              />
              <SettingsSelectField
                control={form.control}
                name="fontFamily"
                label="字体系列"
                description="选择界面使用的字体"
                placeholder="选择字体"
                options={fontOptions}
              />
            </div>
          </SettingsSection>
        </>
      )}
    </SettingsForm>
  )
}
