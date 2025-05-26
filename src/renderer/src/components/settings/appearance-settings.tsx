'use client'

import { z } from 'zod'

import {
  SettingsForm,
  SettingsSection,
  SettingsSwitchField,
  SettingsSelectField,
  SettingsSliderField,
  SettingsRadioField
} from './components'
import { useTheme } from '@renderer/hooks/use-theme'

const appearanceSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  fontSize: z.number().min(12).max(20),
  fontFamily: z.string(),
  sidebarCollapsed: z.boolean(),
  compactMode: z.boolean(),
  showAnimations: z.boolean(),
  accentColor: z.string()
})

type AppearanceSettingsForm = z.infer<typeof appearanceSettingsSchema>

const defaultValues: AppearanceSettingsForm = {
  theme: 'system',
  fontSize: 14,
  fontFamily: 'system',
  sidebarCollapsed: false,
  compactMode: false,
  showAnimations: true,
  accentColor: 'blue'
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

const accentColorOptions = [
  { value: 'blue', label: '蓝色' },
  { value: 'green', label: '绿色' },
  { value: 'purple', label: '紫色' },
  { value: 'orange', label: '橙色' },
  { value: 'red', label: '红色' },
  { value: 'pink', label: '粉色' }
]

export function AppearanceSettings() {
  const { setTheme } = useTheme()

  const mapFormDataToSettings = (data: AppearanceSettingsForm) => {
    // 应用主题更改
    setTheme(data.theme)

    return [
      {
        key: 'appearance.theme',
        value: data.theme,
        category: 'appearance',
        description: '应用主题'
      },
      {
        key: 'appearance.fontSize',
        value: data.fontSize,
        category: 'appearance',
        description: '字体大小'
      },
      {
        key: 'appearance.fontFamily',
        value: data.fontFamily,
        category: 'appearance',
        description: '字体系列'
      },
      {
        key: 'appearance.sidebarCollapsed',
        value: data.sidebarCollapsed,
        category: 'appearance',
        description: '侧边栏默认折叠'
      },
      {
        key: 'appearance.compactMode',
        value: data.compactMode,
        category: 'appearance',
        description: '紧凑模式'
      },
      {
        key: 'appearance.showAnimations',
        value: data.showAnimations,
        category: 'appearance',
        description: '显示动画'
      },
      {
        key: 'appearance.accentColor',
        value: data.accentColor,
        category: 'appearance',
        description: '强调色'
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
            <SettingsRadioField
              control={form.control}
              name="theme"
              label="主题模式"
              options={themeOptions}
              orientation="horizontal"
            />

            <div className="grid grid-cols-2 gap-4">
              <SettingsSliderField
                control={form.control}
                name="fontSize"
                label="字体大小"
                description="调整界面字体大小"
                min={12}
                max={20}
                step={1}
                formatValue={(value) => `${value}px`}
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

          <SettingsSection title="颜色设置" description="自定义应用程序的视觉样式">
            <SettingsSelectField
              control={form.control}
              name="accentColor"
              label="强调色"
              description="选择应用程序的强调色"
              placeholder="选择颜色"
              options={accentColorOptions}
            />
          </SettingsSection>

          <SettingsSection
            title="界面选项"
            description="配置界面行为和显示选项"
            showSeparator={false}
          >
            <SettingsSwitchField
              control={form.control}
              name="sidebarCollapsed"
              label="默认折叠侧边栏"
              description="启动时侧边栏是否默认折叠"
            />

            <SettingsSwitchField
              control={form.control}
              name="compactMode"
              label="紧凑模式"
              description="减少界面元素间距，显示更多内容"
            />

            <SettingsSwitchField
              control={form.control}
              name="showAnimations"
              label="显示动画"
              description="启用界面过渡动画效果"
              showSeparator={false}
            />
          </SettingsSection>
        </>
      )}
    </SettingsForm>
  )
}
