import { SettingsService } from '../services/settings.service'
import type {
  GetSettingsByCategoryInput,
  GetSettingInput,
  SetSettingInput,
  SetSettingsInput,
  DeleteSettingInput,
  ResetSettingsInput
} from '../types/inputs'

export function settingsRouter(t: any) {
  return {
    // 获取所有设置
    getSettings: t.procedure.action(async () => {
      return await SettingsService.getSettings()
    }),

    // 根据分类获取设置
    getSettingsByCategory: t.procedure
      .input()
      .action(async ({ input }: { input: GetSettingsByCategoryInput }) => {
        return await SettingsService.getSettingsByCategory(input)
      }),

    // 根据键获取单个设置
    getSetting: t.procedure.input().action(async ({ input }: { input: GetSettingInput }) => {
      return await SettingsService.getSetting(input)
    }),

    // 创建或更新设置
    setSetting: t.procedure.input().action(async ({ input }: { input: SetSettingInput }) => {
      return await SettingsService.setSetting(input)
    }),

    // 批量设置多个配置
    setSettings: t.procedure.input().action(async ({ input }: { input: SetSettingsInput }) => {
      return await SettingsService.setSettings(input)
    }),

    // 删除设置
    deleteSetting: t.procedure.input().action(async ({ input }: { input: DeleteSettingInput }) => {
      return await SettingsService.deleteSetting(input)
    }),

    // 重置设置到默认值
    resetSettings: t.procedure.input().action(async ({ input }: { input: ResetSettingsInput }) => {
      return await SettingsService.resetSettings(input)
    }),

    // 获取设置分类列表
    getSettingsCategories: t.procedure.action(async () => {
      return await SettingsService.getSettingsCategories()
    })
  }
}
