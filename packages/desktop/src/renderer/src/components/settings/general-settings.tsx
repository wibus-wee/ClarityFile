'use client'

import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'

import {
  SettingsForm,
  SettingsSection,
  SettingsSwitchField,
  SettingsInputField,
  SettingsTextareaField
} from './components'

// 创建动态 schema 函数，支持翻译
function createGeneralSettingsSchema(t: TFunction) {
  return z.object({
    appName: z.string().min(1, t('settings:general.appNameValidation')),
    autoSave: z.boolean(),
    autoBackup: z.boolean(),
    backupInterval: z.number().min(1).max(60),
    defaultProjectPath: z.string(),
    maxRecentProjects: z.number().min(1).max(20),
    description: z.string().optional()
  })
}

// 创建一个基础 schema 用于类型推断
const baseGeneralSettingsSchema = z.object({
  appName: z.string(),
  autoSave: z.boolean(),
  autoBackup: z.boolean(),
  backupInterval: z.number(),
  defaultProjectPath: z.string(),
  maxRecentProjects: z.number(),
  description: z.string().optional()
})

type GeneralSettingsForm = z.infer<typeof baseGeneralSettingsSchema>

const defaultValues: GeneralSettingsForm = {
  appName: 'ClarityFile',
  autoSave: true,
  autoBackup: false,
  backupInterval: 30,
  defaultProjectPath: '',
  maxRecentProjects: 10,
  description: ''
}

export function GeneralSettings() {
  const { t } = useTranslation(['settings', 'common'])

  const generalSettingsSchema = createGeneralSettingsSchema(t)

  // 使用翻译创建设置映射函数
  const mapFormDataToSettings = (data: GeneralSettingsForm) => [
    {
      key: 'general.appName',
      value: data.appName,
      category: 'general',
      description: t('settings:general.appName')
    },
    {
      key: 'general.autoSave',
      value: data.autoSave,
      category: 'general',
      description: t('settings:general.autoSave')
    },
    {
      key: 'general.autoBackup',
      value: data.autoBackup,
      category: 'general',
      description: t('settings:general.autoBackup')
    },
    {
      key: 'general.backupInterval',
      value: data.backupInterval,
      category: 'general',
      description: t('settings:general.backupInterval')
    },
    {
      key: 'general.defaultProjectPath',
      value: data.defaultProjectPath,
      category: 'general',
      description: t('settings:general.defaultProjectPath')
    },
    {
      key: 'general.maxRecentProjects',
      value: data.maxRecentProjects,
      category: 'general',
      description: t('settings:general.maxRecentProjects')
    },
    {
      key: 'general.description',
      value: data.description || '',
      category: 'general',
      description: t('settings:general.description')
    }
  ]

  return (
    <SettingsForm
      category="general"
      schema={generalSettingsSchema}
      defaultValues={defaultValues}
      mapFormDataToSettings={mapFormDataToSettings}
      submitButtonText={t('common:save')}
    >
      {(form) => (
        <>
          <SettingsSection
            title={t('settings:general.title')}
            description={t('settings:descriptions.general')}
          >
            <SettingsInputField
              control={form.control}
              name="appName"
              label={t('settings:general.appName')}
              description={t('settings:general.appNameDescription')}
              placeholder="ClarityFile"
            />

            <SettingsTextareaField
              control={form.control}
              name="description"
              label={t('settings:general.description')}
              description={t('settings:general.descriptionDescription')}
              placeholder="文件管理和项目组织工具"
              resize={false}
            />
          </SettingsSection>

          <SettingsSection
            title={t('settings:general.backupSettings')}
            description={t('settings:general.autoSaveDescription')}
          >
            <SettingsSwitchField
              control={form.control}
              name="autoSave"
              label={t('settings:general.autoSave')}
              description={t('settings:general.autoSaveDescription')}
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="autoBackup"
              label={t('settings:general.autoBackup')}
              description={t('settings:general.autoBackupDescription')}
              className="flex flex-row items-center justify-between py-2"
            />
          </SettingsSection>

          <SettingsSection
            title={t('settings:general.defaultProjectPath')}
            description={t('settings:general.defaultProjectPathDescription')}
          >
            <div className="grid grid-cols-2 gap-4">
              <SettingsInputField
                control={form.control}
                name="backupInterval"
                label={t('settings:general.backupInterval')}
                description={t('settings:general.backupIntervalDescription')}
                type="number"
                min="1"
                max="60"
                onChange={(value) => parseInt(value)}
              />

              <SettingsInputField
                control={form.control}
                name="maxRecentProjects"
                label={t('settings:general.maxRecentProjects')}
                description={t('settings:general.maxRecentProjectsDescription')}
                type="number"
                min="1"
                max="20"
                onChange={(value) => parseInt(value)}
              />
            </div>

            <SettingsInputField
              control={form.control}
              name="defaultProjectPath"
              label={t('settings:general.defaultProjectPath')}
              description={t('settings:general.defaultProjectPathDescription')}
              placeholder="/Users/username/Documents/ClarityFile"
              type="directory"
            />
          </SettingsSection>
        </>
      )}
    </SettingsForm>
  )
}
