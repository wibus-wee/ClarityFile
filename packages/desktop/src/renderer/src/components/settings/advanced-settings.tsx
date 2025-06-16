'use client'

import { z } from 'zod'

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

const mapFormDataToSettings = (data: AdvancedSettingsForm) => [
  {
    key: 'advanced.debugMode',
    value: data.debugMode,
    category: 'advanced',
    description: '调试模式'
  },
  {
    key: 'advanced.developerTools',
    value: data.developerTools,
    category: 'advanced',
    description: '开发者工具'
  },
  {
    key: 'advanced.experimentalFeatures',
    value: data.experimentalFeatures,
    category: 'advanced',
    description: '实验性功能'
  },
  {
    key: 'advanced.logLevel',
    value: data.logLevel,
    category: 'advanced',
    description: '日志级别'
  },
  {
    key: 'advanced.maxLogFiles',
    value: data.maxLogFiles,
    category: 'advanced',
    description: '最大日志文件数'
  },
  {
    key: 'advanced.enableTelemetry',
    value: data.enableTelemetry,
    category: 'advanced',
    description: '启用遥测'
  }
]

export function AdvancedSettings() {
  return (
    <SettingsForm
      category="advanced"
      schema={advancedSettingsSchema}
      defaultValues={defaultValues}
      mapFormDataToSettings={mapFormDataToSettings}
      submitButtonText="保存设置"
    >
      {(form) => (
        <>
          <SettingsSection title="开发者选项" description="配置应用程序的高级功能和开发者选项">
            <SettingsSwitchField
              control={form.control}
              name="debugMode"
              label="调试模式"
              description="启用详细的调试信息"
            />

            <SettingsSwitchField
              control={form.control}
              name="developerTools"
              label="开发者工具"
              description="启用开发者工具访问"
            />

            <SettingsSwitchField
              control={form.control}
              name="experimentalFeatures"
              label="实验性功能"
              description="启用正在开发中的实验性功能（可能不稳定）"
              showSeparator={false}
            />
          </SettingsSection>

          <SettingsSection title="日志设置" description="配置应用程序的日志记录选项">
            <div className="grid grid-cols-2 gap-4">
              <SettingsInputField
                control={form.control}
                name="logLevel"
                label="日志级别"
                description="设置应用程序日志记录级别"
                placeholder="info"
              />

              <SettingsInputField
                control={form.control}
                name="maxLogFiles"
                label="最大日志文件数"
                description="保留的最大日志文件数量"
                type="number"
                min="1"
                max="100"
              />
            </div>
          </SettingsSection>

          <SettingsSection
            title="数据收集"
            description="配置数据收集和遥测选项"
            showSeparator={false}
          >
            <SettingsSwitchField
              control={form.control}
              name="enableTelemetry"
              label="启用遥测"
              description="发送匿名使用数据以帮助改进应用程序"
              showSeparator={false}
            />
          </SettingsSection>

          <SettingsResetSection />
        </>
      )}
    </SettingsForm>
  )
}
