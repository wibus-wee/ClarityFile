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

export function NotificationSettings() {
  const { t } = useTranslation('settings')

  const soundOptions = [
    { value: 'default', label: t('notifications.soundOptions.default') },
    { value: 'chime', label: t('notifications.soundOptions.chime') },
    { value: 'bell', label: t('notifications.soundOptions.bell') },
    { value: 'none', label: t('notifications.soundOptions.none') }
  ]

  const mapFormDataToSettings = (data: NotificationSettingsForm) => [
    {
      key: 'notifications.enabled',
      value: data.enabled,
      category: 'notifications',
      description: t('notifications.enabled')
    },
    {
      key: 'notifications.sound',
      value: data.sound,
      category: 'notifications',
      description: t('notifications.sound')
    },
    {
      key: 'notifications.desktop',
      value: data.desktop,
      category: 'notifications',
      description: t('notifications.desktop')
    },
    {
      key: 'notifications.projectUpdates',
      value: data.projectUpdates,
      category: 'notifications',
      description: t('notifications.projectUpdates')
    },
    {
      key: 'notifications.fileChanges',
      value: data.fileChanges,
      category: 'notifications',
      description: t('notifications.fileChanges')
    },
    {
      key: 'notifications.systemAlerts',
      value: data.systemAlerts,
      category: 'notifications',
      description: t('notifications.systemAlerts')
    },
    {
      key: 'notifications.soundType',
      value: data.soundType,
      category: 'notifications',
      description: t('notifications.soundType')
    }
  ]

  return (
    <SettingsForm
      category="notifications"
      schema={notificationSettingsSchema}
      defaultValues={defaultValues}
      mapFormDataToSettings={mapFormDataToSettings}
    >
      {(form) => (
        <>
          <SettingsSection
            title={t('notifications.basicSettings')}
            description={t('notifications.basicDescription')}
          >
            <SettingsSwitchField
              control={form.control}
              name="enabled"
              label={t('notifications.enabled')}
              description={t('notifications.enabledDescription')}
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="sound"
              label={t('notifications.sound')}
              description={t('notifications.soundDescription')}
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="desktop"
              label={t('notifications.desktop')}
              description={t('notifications.desktopDescription')}
              className="flex flex-row items-center justify-between py-2"
              showSeparator={false}
            />
          </SettingsSection>

          <SettingsSection
            title={t('notifications.soundType')}
            description={t('notifications.soundTypeDescription')}
          >
            <SettingsSelectField
              control={form.control}
              name="soundType"
              label={t('notifications.soundType')}
              description={t('notifications.soundTypeDescription')}
              placeholder={t('notifications.soundTypeDescription')}
              options={soundOptions}
            />
          </SettingsSection>

          <SettingsSection
            title={t('notifications.projectUpdates')}
            description={t('notifications.basicDescription')}
            showSeparator={false}
          >
            <SettingsSwitchField
              control={form.control}
              name="projectUpdates"
              label={t('notifications.projectUpdates')}
              description={t('notifications.projectUpdatesDescription')}
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="fileChanges"
              label={t('notifications.fileChanges')}
              description={t('notifications.fileChangesDescription')}
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="systemAlerts"
              label={t('notifications.systemAlerts')}
              description={t('notifications.systemAlertsDescription')}
              className="flex flex-row items-center justify-between py-2"
              showSeparator={false}
            />
          </SettingsSection>
        </>
      )}
    </SettingsForm>
  )
}
