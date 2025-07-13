'use client'

import { z } from 'zod'
import { useTranslation } from '@renderer/i18n/hooks'
import type { GeneralTranslationFunction } from '@renderer/i18n/types'

import {
  SettingsForm,
  SettingsSection,
  SettingsSwitchField,
  SettingsInputField,
  SettingsTextareaField
} from './components'

// 创建动态 schema 函数，支持翻译
function createGeneralSettingsSchema(t: GeneralTranslationFunction) {
  return z.object({
    appName: z.string().min(1, t('general.appNameValidation')),
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
  const { t } = useTranslation()

  const generalSettingsSchema = createGeneralSettingsSchema(t)

  // 使用翻译创建设置映射函数
  const mapFormDataToSettings = (data: GeneralSettingsForm) => [
    {
      key: 'general.appName',
      value: data.appName,
      category: 'general',
      description: t('general.appName')
    },
    {
      key: 'general.autoSave',
      value: data.autoSave,
      category: 'general',
      description: t('general.autoSave')
    },
    {
      key: 'general.autoBackup',
      value: data.autoBackup,
      category: 'general',
      description: t('general.autoBackup')
    },
    {
      key: 'general.backupInterval',
      value: data.backupInterval,
      category: 'general',
      description: t('general.backupInterval')
    },
    {
      key: 'general.defaultProjectPath',
      value: data.defaultProjectPath,
      category: 'general',
      description: t('general.defaultProjectPath')
    },
    {
      key: 'general.maxRecentProjects',
      value: data.maxRecentProjects,
      category: 'general',
      description: t('general.maxRecentProjects')
    },
    {
      key: 'general.description',
      value: data.description || '',
      category: 'general',
      description: t('general.description')
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
          <SettingsSection title={t('general.title')} description={t('descriptions.general')}>
            <SettingsInputField
              control={form.control}
              name="appName"
              label={t('general.appName')}
              description={t('general.appNameDescription')}
              placeholder="ClarityFile"
            />

            <SettingsTextareaField
              control={form.control}
              name="description"
              label={t('general.description')}
              description={t('general.descriptionDescription')}
              placeholder="文件管理和项目组织工具"
              resize={false}
            />
          </SettingsSection>

          <SettingsSection
            title={t('general.backupSettings')}
            description={t('general.autoSaveDescription')}
          >
            <SettingsSwitchField
              control={form.control}
              name="autoSave"
              label={t('general.autoSave')}
              description={t('general.autoSaveDescription')}
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="autoBackup"
              label={t('general.autoBackup')}
              description={t('general.autoBackupDescription')}
              className="flex flex-row items-center justify-between py-2"
            />
          </SettingsSection>

          <SettingsSection
            title={t('general.defaultProjectPath')}
            description={t('general.defaultProjectPathDescription')}
          >
            <div className="grid grid-cols-2 gap-4">
              <SettingsInputField
                control={form.control}
                name="backupInterval"
                label={t('general.backupInterval')}
                description={t('general.backupIntervalDescription')}
                type="number"
                min="1"
                max="60"
                onChange={(value) => parseInt(value)}
              />

              <SettingsInputField
                control={form.control}
                name="maxRecentProjects"
                label={t('general.maxRecentProjects')}
                description={t('general.maxRecentProjectsDescription')}
                type="number"
                min="1"
                max="20"
                onChange={(value) => parseInt(value)}
              />
            </div>

            <SettingsInputField
              control={form.control}
              name="defaultProjectPath"
              label={t('general.defaultProjectPath')}
              description={t('general.defaultProjectPathDescription')}
              placeholder="/Users/username/Documents/ClarityFile"
              type="directory"
            />
          </SettingsSection>
        </>
      )}
    </SettingsForm>
  )
}
