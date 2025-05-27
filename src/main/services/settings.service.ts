import { db } from '../db'
import { settings } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import type {
  GetSettingsByCategoryInput,
  GetSettingInput,
  SetSettingInput,
  SetSettingsInput,
  DeleteSettingInput,
  ResetSettingsInput
} from '../types/inputs'
import type { SuccessResponse, SettingsCategoriesOutput } from '../types/outputs'

export class SettingsService {
  // 获取所有设置
  static async getSettings() {
    const result = await db.select().from(settings).orderBy(settings.category, settings.key)
    return result
  }

  // 根据分类获取设置
  static async getSettingsByCategory(input: GetSettingsByCategoryInput) {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.category, input.category))
      .orderBy(settings.key)
    return result
  }

  // 根据键获取单个设置
  static async getSetting(input: GetSettingInput) {
    const result = await db.select().from(settings).where(eq(settings.key, input.key)).limit(1)
    return result[0] || null
  }

  // 创建或更新设置
  static async setSetting(input: SetSettingInput) {
    // 先检查设置是否已存在
    const existing = await db.select().from(settings).where(eq(settings.key, input.key)).limit(1)

    if (existing.length > 0) {
      // 更新现有设置
      const result = await db
        .update(settings)
        .set({
          value: JSON.stringify(input.value),
          category: input.category,
          isUserModifiable: input.isUserModifiable ?? true,
          updatedAt: new Date()
        })
        .where(eq(settings.key, input.key))
        .returning()
      return result[0]
    } else {
      // 创建新设置
      const result = await db
        .insert(settings)
        .values({
          key: input.key,
          value: JSON.stringify(input.value),
          category: input.category,
          isUserModifiable: input.isUserModifiable ?? true
        })
        .returning()
      return result[0]
    }
  }

  // 批量设置多个配置
  static async setSettings(input: SetSettingsInput) {
    const results: any[] = []

    for (const setting of input) {
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, setting.key))
        .limit(1)

      if (existing.length > 0) {
        // 更新现有设置
        const result = await db
          .update(settings)
          .set({
            value: JSON.stringify(setting.value),
            category: setting.category,
            isUserModifiable: setting.isUserModifiable ?? true,
            updatedAt: new Date()
          })
          .where(eq(settings.key, setting.key))
          .returning()
        results.push(result[0])
      } else {
        // 创建新设置
        const result = await db
          .insert(settings)
          .values({
            key: setting.key,
            value: JSON.stringify(setting.value),
            category: setting.category,
            isUserModifiable: setting.isUserModifiable ?? true
          })
          .returning()
        results.push(result[0])
      }
    }

    return results
  }

  // 删除设置
  static async deleteSetting(input: DeleteSettingInput): Promise<SuccessResponse> {
    // 检查设置是否允许用户修改
    const setting = await db.select().from(settings).where(eq(settings.key, input.key)).limit(1)

    if (setting.length === 0) {
      throw new Error('设置不存在')
    }

    if (!setting[0].isUserModifiable) {
      throw new Error('此设置不允许删除')
    }

    await db.delete(settings).where(eq(settings.key, input.key))
    return { success: true }
  }

  // 重置设置到默认值
  static async resetSettings(input: ResetSettingsInput): Promise<SuccessResponse> {
    if (input.category) {
      // 重置特定分类的设置
      await db
        .delete(settings)
        .where(and(eq(settings.category, input.category), eq(settings.isUserModifiable, true)))
    } else {
      // 重置所有用户可修改的设置
      await db.delete(settings).where(eq(settings.isUserModifiable, true))
    }
    return { success: true }
  }

  // 获取设置分类列表
  static async getSettingsCategories(): Promise<SettingsCategoriesOutput> {
    const result = await db
      .selectDistinct({ category: settings.category })
      .from(settings)
      .orderBy(settings.category)
    return result.map((r) => r.category)
  }
}
