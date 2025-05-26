'use client'

import { z } from 'zod'

import {
  SettingsForm,
  SettingsSection,
  SettingsSwitchField,
  SettingsSelectField
} from './components'

const notificationSettingsSchema = z.object({
  enabled: z.boolean(),
  sound: z.boolean(),
  desktop: z.boolean(),
  projectUpdates: z.boolean(),
  fileChanges: z.boolean(),
  systemAlerts: z.boolean(),
  soundType: z.string()
})

type NotificationSettingsForm = z.infer<typeof notificationSettingsSchema>

const defaultValues: NotificationSettingsForm = {
  enabled: true,
  sound: true,
  desktop: true,
  projectUpdates: true,
  fileChanges: false,
  systemAlerts: true,
  soundType: 'default'
}

const soundOptions = [
  { value: 'default', label: '默认' },
  { value: 'subtle', label: '轻柔' },
  { value: 'modern', label: '现代' },
  { value: 'classic', label: '经典' },
  { value: 'none', label: '无声音' }
]

const mapFormDataToSettings = (data: NotificationSettingsForm) => [
  {
    key: 'notifications.enabled',
    value: data.enabled,
    category: 'notifications',
    description: '启用通知'
  },
  {
    key: 'notifications.sound',
    value: data.sound,
    category: 'notifications',
    description: '通知声音'
  },
  {
    key: 'notifications.desktop',
    value: data.desktop,
    category: 'notifications',
    description: '桌面通知'
  },
  {
    key: 'notifications.projectUpdates',
    value: data.projectUpdates,
    category: 'notifications',
    description: '项目更新通知'
  },
  {
    key: 'notifications.fileChanges',
    value: data.fileChanges,
    category: 'notifications',
    description: '文件变更通知'
  },
  {
    key: 'notifications.systemAlerts',
    value: data.systemAlerts,
    category: 'notifications',
    description: '系统警告通知'
  },
  {
    key: 'notifications.soundType',
    value: data.soundType,
    category: 'notifications',
    description: '通知声音类型'
  }
]

export function NotificationSettings() {
  return (
    <SettingsForm
      category="notifications"
      schema={notificationSettingsSchema}
      defaultValues={defaultValues}
      mapFormDataToSettings={mapFormDataToSettings}
      submitButtonText="保存设置"
    >
      {(form) => (
        <>
          <SettingsSection title="基本设置" description="管理应用程序的通知偏好">
            <SettingsSwitchField
              control={form.control}
              name="enabled"
              label="启用通知"
              description="接收应用程序通知"
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="sound"
              label="通知声音"
              description="播放通知声音"
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="desktop"
              label="桌面通知"
              description="显示桌面通知"
              className="flex flex-row items-center justify-between py-2"
              showSeparator={false}
            />
          </SettingsSection>

          <SettingsSection title="声音设置" description="配置通知声音选项">
            <SettingsSelectField
              control={form.control}
              name="soundType"
              label="通知声音类型"
              description="选择通知播放的声音类型"
              placeholder="选择声音类型"
              options={soundOptions}
            />
          </SettingsSection>

          <SettingsSection
            title="通知类型"
            description="选择要接收的通知类型"
            showSeparator={false}
          >
            <SettingsSwitchField
              control={form.control}
              name="projectUpdates"
              label="项目更新"
              description="项目状态变更时通知"
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="fileChanges"
              label="文件变更"
              description="文件被修改时通知"
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="systemAlerts"
              label="系统警告"
              description="系统错误和警告通知"
              className="flex flex-row items-center justify-between py-2"
              showSeparator={false}
            />
          </SettingsSection>
        </>
      )}
    </SettingsForm>
  )
}
