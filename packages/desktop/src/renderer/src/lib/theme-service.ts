/**
 * ThemeService - 自定义主题数据管理服务
 * 
 * 负责自定义主题的数据存储、读取和管理
 * 与数据库 settings 表集成，通过 TIPC 进行数据同步
 */

import type { CustomTheme } from '@renderer/types/theme'
import { generateThemeId } from '@renderer/lib/utils'
import { tipcClient } from './tipc-client'

export class ThemeService {
  private static readonly CUSTOM_THEMES_KEY = 'appearance.customThemes'
  private static readonly ACTIVE_CUSTOM_THEME_KEY = 'appearance.activeCustomTheme'

  /**
   * 获取所有自定义主题
   */
  static async getCustomThemes(): Promise<CustomTheme[]> {
    try {
      const setting = await tipcClient.getSetting({ key: this.CUSTOM_THEMES_KEY })
      
      if (!setting || !setting.value) {
        return []
      }

      const themesData = typeof setting.value === 'string' 
        ? JSON.parse(setting.value) 
        : setting.value

      return Object.values(themesData as Record<string, CustomTheme>)
    } catch (error) {
      console.error('Failed to get custom themes:', error)
      return []
    }
  }

  /**
   * 根据 ID 获取单个自定义主题
   */
  static async getCustomTheme(themeId: string): Promise<CustomTheme | null> {
    try {
      const themes = await this.getCustomThemes()
      return themes.find(theme => theme.id === themeId) || null
    } catch (error) {
      console.error('Failed to get custom theme:', error)
      return null
    }
  }

  /**
   * 保存自定义主题
   */
  static async saveCustomTheme(
    themeData: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CustomTheme> {
    try {
      // 创建新主题对象
      const newTheme: CustomTheme = {
        ...themeData,
        id: generateThemeId(themeData.name),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 获取现有主题
      const existingThemes = await this.getCustomThemes()
      const themesMap = existingThemes.reduce((acc, theme) => {
        acc[theme.id] = theme
        return acc
      }, {} as Record<string, CustomTheme>)

      // 添加新主题
      themesMap[newTheme.id] = newTheme

      // 保存到数据库
      await tipcClient.setSetting({
        key: this.CUSTOM_THEMES_KEY,
        value: themesMap,
        category: 'appearance',
        description: '自定义主题配置'
      })

      console.log('Custom theme saved:', newTheme.id)
      return newTheme
    } catch (error) {
      console.error('Failed to save custom theme:', error)
      throw new Error('保存自定义主题失败')
    }
  }

  /**
   * 更新自定义主题
   */
  static async updateCustomTheme(
    themeId: string,
    updates: Partial<Omit<CustomTheme, 'id' | 'createdAt'>>
  ): Promise<CustomTheme> {
    try {
      const existingThemes = await this.getCustomThemes()
      const themesMap = existingThemes.reduce((acc, theme) => {
        acc[theme.id] = theme
        return acc
      }, {} as Record<string, CustomTheme>)

      const existingTheme = themesMap[themeId]
      if (!existingTheme) {
        throw new Error('主题不存在')
      }

      // 更新主题
      const updatedTheme: CustomTheme = {
        ...existingTheme,
        ...updates,
        updatedAt: new Date().toISOString()
      }

      themesMap[themeId] = updatedTheme

      // 保存到数据库
      await tipcClient.setSetting({
        key: this.CUSTOM_THEMES_KEY,
        value: themesMap,
        category: 'appearance',
        description: '自定义主题配置'
      })

      console.log('Custom theme updated:', themeId)
      return updatedTheme
    } catch (error) {
      console.error('Failed to update custom theme:', error)
      throw new Error('更新自定义主题失败')
    }
  }

  /**
   * 删除自定义主题
   */
  static async deleteCustomTheme(themeId: string): Promise<void> {
    try {
      const existingThemes = await this.getCustomThemes()
      const themesMap = existingThemes.reduce((acc, theme) => {
        acc[theme.id] = theme
        return acc
      }, {} as Record<string, CustomTheme>)

      if (!themesMap[themeId]) {
        throw new Error('主题不存在')
      }

      // 删除主题
      delete themesMap[themeId]

      // 保存到数据库
      await tipcClient.setSetting({
        key: this.CUSTOM_THEMES_KEY,
        value: themesMap,
        category: 'appearance',
        description: '自定义主题配置'
      })

      // 如果删除的是当前激活的主题，清除激活状态
      const activeTheme = await this.getActiveCustomTheme()
      if (activeTheme === themeId) {
        await this.setActiveCustomTheme(null)
      }

      console.log('Custom theme deleted:', themeId)
    } catch (error) {
      console.error('Failed to delete custom theme:', error)
      throw new Error('删除自定义主题失败')
    }
  }

  /**
   * 获取当前激活的自定义主题 ID
   */
  static async getActiveCustomTheme(): Promise<string | null> {
    try {
      const setting = await tipcClient.getSetting({ key: this.ACTIVE_CUSTOM_THEME_KEY })
      
      if (!setting || !setting.value) {
        return null
      }

      return typeof setting.value === 'string' 
        ? JSON.parse(setting.value) 
        : setting.value
    } catch (error) {
      console.error('Failed to get active custom theme:', error)
      return null
    }
  }

  /**
   * 设置当前激活的自定义主题
   */
  static async setActiveCustomTheme(themeId: string | null): Promise<void> {
    try {
      await tipcClient.setSetting({
        key: this.ACTIVE_CUSTOM_THEME_KEY,
        value: themeId,
        category: 'appearance',
        description: '当前激活的自定义主题'
      })

      console.log('Active custom theme set:', themeId)
    } catch (error) {
      console.error('Failed to set active custom theme:', error)
      throw new Error('设置激活主题失败')
    }
  }

  /**
   * 检查主题名称是否已存在
   */
  static async isThemeNameExists(name: string, excludeId?: string): Promise<boolean> {
    try {
      const themes = await this.getCustomThemes()
      return themes.some(theme => 
        theme.name.toLowerCase() === name.toLowerCase() && 
        theme.id !== excludeId
      )
    } catch (error) {
      console.error('Failed to check theme name existence:', error)
      return false
    }
  }

  /**
   * 导出主题为 JSON 字符串
   */
  static async exportTheme(themeId: string): Promise<string> {
    try {
      const theme = await this.getCustomTheme(themeId)
      if (!theme) {
        throw new Error('主题不存在')
      }

      return JSON.stringify(theme, null, 2)
    } catch (error) {
      console.error('Failed to export theme:', error)
      throw new Error('导出主题失败')
    }
  }

  /**
   * 从 JSON 字符串导入主题
   */
  static async importTheme(jsonString: string): Promise<CustomTheme> {
    try {
      const themeData = JSON.parse(jsonString) as CustomTheme
      
      // 验证主题数据结构
      if (!themeData.name || !themeData.cssContent) {
        throw new Error('主题数据格式不正确')
      }

      // 检查名称是否已存在
      const nameExists = await this.isThemeNameExists(themeData.name)
      if (nameExists) {
        throw new Error('主题名称已存在')
      }

      // 保存主题（会生成新的 ID 和时间戳）
      return await this.saveCustomTheme({
        name: themeData.name,
        description: themeData.description,
        author: themeData.author,
        cssContent: themeData.cssContent
      })
    } catch (error) {
      console.error('Failed to import theme:', error)
      throw new Error('导入主题失败')
    }
  }
}
