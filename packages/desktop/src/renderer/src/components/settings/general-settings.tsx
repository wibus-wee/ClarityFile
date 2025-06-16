'use client'

import { z } from 'zod'

import {
  SettingsForm,
  SettingsSection,
  SettingsSwitchField,
  SettingsInputField,
  SettingsTextareaField
} from './components'

const generalSettingsSchema = z.object({
  appName: z.string().min(1, '应用名称不能为空'),
  autoSave: z.boolean(),
  autoBackup: z.boolean(),
  backupInterval: z.number().min(1).max(60),
  defaultProjectPath: z.string(),
  maxRecentProjects: z.number().min(1).max(20),
  description: z.string().optional()
})

type GeneralSettingsForm = z.infer<typeof generalSettingsSchema>

const defaultValues: GeneralSettingsForm = {
  appName: 'ClarityFile',
  autoSave: true,
  autoBackup: false,
  backupInterval: 30,
  defaultProjectPath: '',
  maxRecentProjects: 10,
  description: ''
}

const mapFormDataToSettings = (data: GeneralSettingsForm) => [
  {
    key: 'general.appName',
    value: data.appName,
    category: 'general',
    description: '应用程序名称'
  },
  {
    key: 'general.autoSave',
    value: data.autoSave,
    category: 'general',
    description: '自动保存功能'
  },
  {
    key: 'general.autoBackup',
    value: data.autoBackup,
    category: 'general',
    description: '自动备份功能'
  },
  {
    key: 'general.backupInterval',
    value: data.backupInterval,
    category: 'general',
    description: '备份间隔（分钟）'
  },
  {
    key: 'general.defaultProjectPath',
    value: data.defaultProjectPath,
    category: 'general',
    description: '默认项目路径'
  },
  {
    key: 'general.maxRecentProjects',
    value: data.maxRecentProjects,
    category: 'general',
    description: '最大最近项目数量'
  },
  {
    key: 'general.description',
    value: data.description || '',
    category: 'general',
    description: '应用描述'
  }
]

export function GeneralSettings() {
  return (
    <SettingsForm
      category="general"
      schema={generalSettingsSchema}
      defaultValues={defaultValues}
      mapFormDataToSettings={mapFormDataToSettings}
      submitButtonText="保存设置"
    >
      {(form) => (
        <>
          <SettingsSection title="应用程序信息" description="配置应用程序的基本信息">
            <SettingsInputField
              control={form.control}
              name="appName"
              label="应用名称"
              description="显示在应用程序标题栏和关于页面的名称"
              placeholder="ClarityFile"
            />

            <SettingsTextareaField
              control={form.control}
              name="description"
              label="应用描述"
              description="应用程序的简短描述"
              placeholder="文件管理和项目组织工具"
              resize={false}
            />
          </SettingsSection>

          <SettingsSection title="自动化设置" description="配置自动保存和备份功能">
            <SettingsSwitchField
              control={form.control}
              name="autoSave"
              label="自动保存"
              description="自动保存文档更改"
              className="flex flex-row items-center justify-between py-2"
            />

            <SettingsSwitchField
              control={form.control}
              name="autoBackup"
              label="自动备份"
              description="定期创建项目备份"
              className="flex flex-row items-center justify-between py-2"
              showSeparator={false}
            />
          </SettingsSection>

          <SettingsSection
            title="项目设置"
            description="配置项目相关的默认设置"
            showSeparator={false}
          >
            <div className="grid grid-cols-2 gap-4">
              <SettingsInputField
                control={form.control}
                name="backupInterval"
                label="备份间隔（分钟）"
                description="自动备份的时间间隔"
                type="number"
                min="1"
                max="60"
                onChange={(value) => parseInt(value)}
              />

              <SettingsInputField
                control={form.control}
                name="maxRecentProjects"
                label="最近项目数量"
                description="保留的最近项目数量"
                type="number"
                min="1"
                max="20"
                onChange={(value) => parseInt(value)}
              />
            </div>

            <SettingsInputField
              control={form.control}
              name="defaultProjectPath"
              label="默认项目路径"
              description="新建项目时的默认保存路径"
              placeholder="/Users/username/Documents/ClarityFile"
              type="directory"
            />
          </SettingsSection>
        </>
      )}
    </SettingsForm>
  )
}
