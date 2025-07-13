'use client'

import { z } from 'zod'
import { useTranslation } from 'react-i18next'

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

export function NotificationSettings() {
  const { t } = useTranslation()

  const soundOptions = [
    { value: 'default', label: t('settings:notifications.soundOptions.default') },
    { value: 'chime', label: t('settings:notifications.soundOptions.chime') },
    { value: 'bell', label: t('settings:notifications.soundOptions.bell') },
    { value: 'none', label: t('settings:notifications.soundOptions.none') }
  ]

  const mapFormDataToSettings = (data: NotificationSettingsForm) => [
    {
      key: 'notifications.enabled',
      value: data.enabled,
      category: 'notifications',
      description: t('settings:notifications.enabled')
    },
    {
      key: 'notifications.sound',
      value: data.sound,
      category: 'notifications',
      description: t('settings:notifications.sound')
    },
    {
      key: 'notifications.desktop',
      value: data.desktop,
      category: 'notifications',
      description: t('settings:notifications.desktop')
    },
    {
      key: 'notifications.projectUpdates',
      value: data.projectUpdates,
      category: 'notifications',
      description: t('settings:notifications.projectUpdates')
    },
    {
      key: 'notifications.fileChanges',
      value: data.fileChanges,
      category: 'notifications',
      description: t('settings:notifications.fileChanges')
    },
    {
      key: 'notifications.systemAlerts',
      value: data.systemAlerts,
      category: 'notifications',
      description: t('settings:notifications.systemAlerts')
    },
    {
      key: 'notifications.soundType',
      value: data.soundType,
      category: 'notifications',
      description: t('settings:notifications.soundType')
    }
  ]

  return (
    <SettingsForm
      category="notifications"
      schema={notificationSettingsSchema}
      defaultValues={defaultValues}
      mapFormDataToSettings={mapFormDataToSettings}
      submitButtonText={t('common:save')}
    >
      {(form) => (
        <>
          <SettingsSection
            title={t('settings:notifications.basicSettings')}
            description={t('settings:notifications.basicDescription')}
          >
            <SettingsSwitchField
              control={form.control}
              name="enabled"
              label={t('settings:notifications.enabled')}
              description={t('settings:notifications.enabledDescription')}
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="sound"
              label={t('settings:notifications.sound')}
              description={t('settings:notifications.soundDescription')}
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="desktop"
              label={t('settings:notifications.desktop')}
              description={t('settings:notifications.desktopDescription')}
              className="flex flex-row items-center justify-between py-2"
              showSeparator={false}
            />
          </SettingsSection>

          <SettingsSection
            title={t('settings:notifications.soundType')}
            description={t('settings:notifications.soundTypeDescription')}
          >
            <SettingsSelectField
              control={form.control}
              name="soundType"
              label={t('settings:notifications.soundType')}
              description={t('settings:notifications.soundTypeDescription')}
              placeholder={t('settings:notifications.soundTypeDescription')}
              options={soundOptions}
            />
          </SettingsSection>

          <SettingsSection
            title={t('settings:notifications.projectUpdates')}
            description={t('settings:notifications.basicDescription')}
            showSeparator={false}
          >
            <SettingsSwitchField
              control={form.control}
              name="projectUpdates"
              label={t('settings:notifications.projectUpdates')}
              description={t('settings:notifications.projectUpdatesDescription')}
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="fileChanges"
              label={t('settings:notifications.fileChanges')}
              description={t('settings:notifications.fileChangesDescription')}
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="systemAlerts"
              label={t('settings:notifications.systemAlerts')}
              description={t('settings:notifications.systemAlertsDescription')}
              className="flex flex-row items-center justify-between py-2"
              showSeparator={false}
            />
          </SettingsSection>
        </>
      )}
    </SettingsForm>
  )
}
