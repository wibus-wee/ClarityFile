import { SettingsService } from '../services/settings.service'
import type {
  GetSettingsByCategoryInput,
  GetSettingInput,
  SetSettingInput,
  SetSettingsInput,
  DeleteSettingInput,
  ResetSettingsInput
} from '../types/inputs'
import { ITipc } from '../types'

export function settingsRouter(t: ITipc) {
  return {
    // 获取所有设置
    getSettings: t.procedure.action(async () => {
      return await SettingsService.getSettings()
    }),

    // 根据分类获取设置
    getSettingsByCategory: t.procedure
      .input<GetSettingsByCategoryInput>()
      .action(async ({ input }) => {
        return await SettingsService.getSettingsByCategory(input)
      }),

    // 根据键获取单个设置
    getSetting: t.procedure.input<GetSettingInput>().action(async ({ input }) => {
      return await SettingsService.getSetting(input)
    }),

    // 创建或更新设置
    setSetting: t.procedure.input<SetSettingInput>().action(async ({ input }) => {
      return await SettingsService.setSetting(input)
    }),

    // 批量设置多个配置
    setSettings: t.procedure.input<SetSettingsInput>().action(async ({ input }) => {
      return await SettingsService.setSettings(input)
    }),

    // 删除设置
    deleteSetting: t.procedure.input<DeleteSettingInput>().action(async ({ input }) => {
      return await SettingsService.deleteSetting(input)
    }),

    // 重置设置到默认值
    resetSettings: t.procedure.input<ResetSettingsInput>().action(async ({ input }) => {
      return await SettingsService.resetSettings(input)
    }),

    // 获取设置分类列表
    getSettingsCategories: t.procedure.action(async () => {
      return await SettingsService.getSettingsCategories()
    })
  }
}
