'use client'

import { z } from 'zod'
import { useTranslation } from 'react-i18next'

import {
  SettingsForm,
  SettingsSection,
  SettingsSwitchField,
  SettingsInputField,
  SettingsResetSection
} from './components'

const advancedSettingsSchema = z.object({
  debugMode: z.boolean(),
  developerTools: z.boolean(),
  experimentalFeatures: z.boolean(),
  logLevel: z.string(),
  maxLogFiles: z.number().min(1).max(100),
  enableTelemetry: z.boolean()
})

type AdvancedSettingsForm = z.infer<typeof advancedSettingsSchema>

const defaultValues: AdvancedSettingsForm = {
  debugMode: false,
  developerTools: false,
  experimentalFeatures: false,
  logLevel: 'info',
  maxLogFiles: 10,
  enableTelemetry: false
}

export function AdvancedSettings() {
  const { t } = useTranslation()

  const mapFormDataToSettings = (data: AdvancedSettingsForm) => [
    {
      key: 'advanced.debugMode',
      value: data.debugMode,
      category: 'advanced',
      description: t('settings:advanced.debugMode')
    },
    {
      key: 'advanced.developerTools',
      value: data.developerTools,
      category: 'advanced',
      description: t('settings:advanced.developerTools')
    },
    {
      key: 'advanced.experimentalFeatures',
      value: data.experimentalFeatures,
      category: 'advanced',
      description: t('settings:advanced.experimentalFeatures')
    },
    {
      key: 'advanced.logLevel',
      value: data.logLevel,
      category: 'advanced',
      description: t('settings:advanced.logLevel')
    },
    {
      key: 'advanced.maxLogFiles',
      value: data.maxLogFiles,
      category: 'advanced',
      description: t('settings:advanced.maxLogFiles')
    },
    {
      key: 'advanced.enableTelemetry',
      value: data.enableTelemetry,
      category: 'advanced',
      description: t('settings:advanced.enableTelemetry')
    }
  ]

  return (
    <SettingsForm
      category="advanced"
      schema={advancedSettingsSchema}
      defaultValues={defaultValues}
      mapFormDataToSettings={mapFormDataToSettings}
      submitButtonText={t('common:save')}
    >
      {(form) => (
        <>
          <SettingsSection
            title={t('settings:advanced.developerOptions')}
            description={t('settings:advanced.developerDescription')}
          >
            <SettingsSwitchField
              control={form.control}
              name="debugMode"
              label={t('settings:advanced.debugMode')}
              description={t('settings:advanced.debugModeDescription')}
            />

            <SettingsSwitchField
              control={form.control}
              name="developerTools"
              label={t('settings:advanced.developerTools')}
              description={t('settings:advanced.developerToolsDescription')}
            />

            <SettingsSwitchField
              control={form.control}
              name="experimentalFeatures"
              label={t('settings:advanced.experimentalFeatures')}
              description={t('settings:advanced.experimentalFeaturesDescription')}
              showSeparator={false}
            />
          </SettingsSection>

          <SettingsSection
            title={t('settings:advanced.logLevel')}
            description={t('settings:advanced.logLevelDescription')}
          >
            <div className="grid grid-cols-2 gap-4">
              <SettingsInputField
                control={form.control}
                name="logLevel"
                label={t('settings:advanced.logLevel')}
                description={t('settings:advanced.logLevelDescription')}
                placeholder="info"
              />

              <SettingsInputField
                control={form.control}
                name="maxLogFiles"
                label={t('settings:advanced.maxLogFiles')}
                description={t('settings:advanced.maxLogFilesDescription')}
                type="number"
                min="1"
                max="100"
              />
            </div>
          </SettingsSection>

          <SettingsSection
            title={t('settings:advanced.enableTelemetry')}
            description={t('settings:advanced.enableTelemetryDescription')}
            showSeparator={false}
          >
            <SettingsSwitchField
              control={form.control}
              name="enableTelemetry"
              label={t('settings:advanced.enableTelemetry')}
              description={t('settings:advanced.enableTelemetryDescription')}
              showSeparator={false}
            />
          </SettingsSection>

          <SettingsResetSection />
        </>
      )}
    </SettingsForm>
  )
}
