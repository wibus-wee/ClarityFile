/**
 * 主题导入工具函数
 * 提供基础的主题导入和验证功能
 */

import { CustomThemeManager } from './custom-theme-manager'
import { ThemeService } from './theme-service'
import type { CustomTheme } from '@renderer/types/theme'

export interface ThemeImportResult {
  success: boolean
  theme?: CustomTheme
  error?: string
}

export interface ThemeValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class ThemeImportUtils {
  /**
   * 从 CSS 文本导入主题
   */
  static async importFromCSS(
    cssContent: string,
    themeName: string,
    options?: {
      description?: string
      author?: string
      preview?: boolean
    }
  ): Promise<ThemeImportResult> {
    try {
      // 验证 CSS 内容
      const validation = this.validateThemeCSS(cssContent)
      if (!validation.isValid) {
        return {
          success: false,
          error: `主题验证失败: ${validation.errors.join(', ')}`
        }
      }

      // 检查主题名称是否已存在
      const nameExists = await ThemeService.isThemeNameExists(themeName)
      if (nameExists) {
        return {
          success: false,
          error: '主题名称已存在，请使用不同的名称'
        }
      }

      // 如果是预览模式，只应用 CSS 不保存
      if (options?.preview) {
        CustomThemeManager.previewThemeCSS(cssContent)
        return {
          success: true,
          theme: {
            id: 'preview',
            name: themeName,
            description: options.description,
            author: options.author,
            cssContent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      }

      // 保存主题
      const theme = await ThemeService.saveCustomTheme({
        name: themeName,
        description: options?.description,
        author: options?.author,
        cssContent
      })

      return {
        success: true,
        theme
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '导入主题时发生未知错误'
      }
    }
  }

  /**
   * 从 JSON 文件导入主题
   */
  static async importFromJSON(jsonContent: string): Promise<ThemeImportResult> {
    try {
      const themeData = JSON.parse(jsonContent) as Partial<CustomTheme>

      // 验证 JSON 结构
      if (!themeData.name || !themeData.cssContent) {
        return {
          success: false,
          error: '主题文件格式不正确，缺少必要的 name 或 cssContent 字段'
        }
      }

      // 验证 CSS 内容
      const validation = this.validateThemeCSS(themeData.cssContent)
      if (!validation.isValid) {
        return {
          success: false,
          error: `主题 CSS 验证失败: ${validation.errors.join(', ')}`
        }
      }

      // 检查主题名称是否已存在
      const nameExists = await ThemeService.isThemeNameExists(themeData.name)
      if (nameExists) {
        return {
          success: false,
          error: '主题名称已存在，请修改主题名称后重新导入'
        }
      }

      // 保存主题
      const theme = await ThemeService.saveCustomTheme({
        name: themeData.name,
        description: themeData.description,
        author: themeData.author,
        cssContent: themeData.cssContent
      })

      return {
        success: true,
        theme
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        return {
          success: false,
          error: '主题文件格式错误，请确保是有效的 JSON 格式'
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : '导入主题时发生未知错误'
      }
    }
  }

  /**
   * 验证主题 CSS 内容
   */
  static validateThemeCSS(cssContent: string): ThemeValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 基础验证
    const basicValidation = CustomThemeManager.validateCSSContent(cssContent)
    if (!basicValidation.isValid) {
      errors.push(...basicValidation.errors)
    }

    // 检查是否包含必要的 CSS 变量
    const requiredVariables = [
      '--background',
      '--foreground',
      '--primary',
      '--primary-foreground'
    ]

    for (const variable of requiredVariables) {
      if (!cssContent.includes(variable)) {
        warnings.push(`缺少推荐的 CSS 变量: ${variable}`)
      }
    }

    // 检查是否同时包含 light 和 dark 模式
    const hasRootSelector = cssContent.includes(':root')
    const hasDarkSelector = cssContent.includes('.dark')

    if (!hasRootSelector) {
      warnings.push('未找到 :root 选择器，可能缺少 light 模式样式')
    }

    if (!hasDarkSelector) {
      warnings.push('未找到 .dark 选择器，可能缺少 dark 模式样式')
    }

    // 检查 CSS 语法基础错误
    const openBraces = (cssContent.match(/{/g) || []).length
    const closeBraces = (cssContent.match(/}/g) || []).length
    if (openBraces !== closeBraces) {
      errors.push('CSS 语法错误：大括号不匹配')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 生成主题模板
   */
  static generateThemeTemplate(themeName: string = 'My Custom Theme'): string {
    return `/* ${themeName} */
/* 自定义主题模板 - 请根据需要修改颜色值 */

:root {
  /* 基础颜色 */
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  
  /* 卡片和弹出层 */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  
  /* 主要颜色 */
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  
  /* 次要颜色 */
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  
  /* 静音和强调色 */
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  
  /* 危险色 */
  --destructive: oklch(0.577 0.245 27.325);
  
  /* 边框和输入 */
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  
  /* 图表颜色 */
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  
  /* 侧边栏颜色 */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  /* 深色模式基础颜色 */
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  
  /* 深色模式卡片和弹出层 */
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  
  /* 深色模式主要颜色 */
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  
  /* 深色模式次要颜色 */
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  
  /* 深色模式静音和强调色 */
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  
  /* 深色模式危险色 */
  --destructive: oklch(0.704 0.191 22.216);
  
  /* 深色模式边框和输入 */
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  
  /* 深色模式图表颜色 */
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  
  /* 深色模式侧边栏颜色 */
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}`
  }

  /**
   * 清理预览状态
   */
  static clearPreview(): void {
    CustomThemeManager.clearPreviewCSS()
  }

  /**
   * 应用主题预览
   */
  static previewTheme(cssContent: string): void {
    CustomThemeManager.previewThemeCSS(cssContent)
  }
}
