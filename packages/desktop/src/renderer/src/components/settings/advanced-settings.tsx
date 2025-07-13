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
  const { t } = useTranslation('settings')

  const mapFormDataToSettings = (data: AdvancedSettingsForm) => [
    {
      key: 'advanced.debugMode',
      value: data.debugMode,
      category: 'advanced',
      description: t('advanced.debugMode')
    },
    {
      key: 'advanced.developerTools',
      value: data.developerTools,
      category: 'advanced',
      description: t('advanced.developerTools')
    },
    {
      key: 'advanced.experimentalFeatures',
      value: data.experimentalFeatures,
      category: 'advanced',
      description: t('advanced.experimentalFeatures')
    },
    {
      key: 'advanced.logLevel',
      value: data.logLevel,
      category: 'advanced',
      description: t('advanced.logLevel')
    },
    {
      key: 'advanced.maxLogFiles',
      value: data.maxLogFiles,
      category: 'advanced',
      description: t('advanced.maxLogFiles')
    },
    {
      key: 'advanced.enableTelemetry',
      value: data.enableTelemetry,
      category: 'advanced',
      description: t('advanced.enableTelemetry')
    }
  ]

  return (
    <SettingsForm
      category="advanced"
      schema={advancedSettingsSchema}
      defaultValues={defaultValues}
      mapFormDataToSettings={mapFormDataToSettings}
    >
      {(form) => (
        <>
          <SettingsSection
            title={t('advanced.developerOptions')}
            description={t('advanced.developerDescription')}
          >
            <SettingsSwitchField
              control={form.control}
              name="debugMode"
              label={t('advanced.debugMode')}
              description={t('advanced.debugModeDescription')}
            />

            <SettingsSwitchField
              control={form.control}
              name="developerTools"
              label={t('advanced.developerTools')}
              description={t('advanced.developerToolsDescription')}
            />

            <SettingsSwitchField
              control={form.control}
              name="experimentalFeatures"
              label={t('advanced.experimentalFeatures')}
              description={t('advanced.experimentalFeaturesDescription')}
              showSeparator={false}
            />
          </SettingsSection>

          <SettingsSection
            title={t('advanced.logLevel')}
            description={t('advanced.logLevelDescription')}
          >
            <div className="grid grid-cols-2 gap-4">
              <SettingsInputField
                control={form.control}
                name="logLevel"
                label={t('advanced.logLevel')}
                description={t('advanced.logLevelDescription')}
                placeholder="info"
              />

              <SettingsInputField
                control={form.control}
                name="maxLogFiles"
                label={t('advanced.maxLogFiles')}
                description={t('advanced.maxLogFilesDescription')}
                type="number"
                min="1"
                max="100"
              />
            </div>
          </SettingsSection>

          <SettingsSection
            title={t('advanced.enableTelemetry')}
            description={t('advanced.enableTelemetryDescription')}
            showSeparator={false}
          >
            <SettingsSwitchField
              control={form.control}
              name="enableTelemetry"
              label={t('advanced.enableTelemetry')}
              description={t('advanced.enableTelemetryDescription')}
              showSeparator={false}
            />
          </SettingsSection>

          <SettingsResetSection />
        </>
      )}
    </SettingsForm>
  )
}
