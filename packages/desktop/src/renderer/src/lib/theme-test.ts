/**
 * 自定义主题功能测试
 * 用于验证 Phase 1 核心功能是否正常工作
 */

import { CustomThemeManager } from './custom-theme-manager'
import { ThemeService } from './theme-service'
import type { CustomTheme } from '@renderer/types/theme'

// 测试用的示例主题 CSS
const SAMPLE_THEME_CSS = `
:root {
  --background: oklch(0.98 0.02 220);
  --foreground: oklch(0.15 0.05 220);
  --primary: oklch(0.55 0.15 220);
  --primary-foreground: oklch(0.98 0.02 220);
  --secondary: oklch(0.95 0.02 220);
  --secondary-foreground: oklch(0.25 0.05 220);
  --muted: oklch(0.95 0.02 220);
  --muted-foreground: oklch(0.45 0.05 220);
  --accent: oklch(0.92 0.05 220);
  --accent-foreground: oklch(0.25 0.05 220);
  --destructive: oklch(0.65 0.2 25);
  --border: oklch(0.90 0.02 220);
  --input: oklch(0.90 0.02 220);
  --ring: oklch(0.55 0.15 220);
}

.dark {
  --background: oklch(0.08 0.02 220);
  --foreground: oklch(0.95 0.02 220);
  --primary: oklch(0.75 0.15 220);
  --primary-foreground: oklch(0.08 0.02 220);
  --secondary: oklch(0.15 0.02 220);
  --secondary-foreground: oklch(0.85 0.02 220);
  --muted: oklch(0.15 0.02 220);
  --muted-foreground: oklch(0.65 0.05 220);
  --accent: oklch(0.20 0.05 220);
  --accent-foreground: oklch(0.85 0.02 220);
  --destructive: oklch(0.75 0.2 25);
  --border: oklch(0.20 0.02 220);
  --input: oklch(0.20 0.02 220);
  --ring: oklch(0.75 0.15 220);
}
`

export class ThemeTestSuite {
  /**
   * 测试 CustomThemeManager 基础功能
   */
  static testCustomThemeManager(): boolean {
    console.log('Testing CustomThemeManager...')
    
    try {
      // 测试初始化
      CustomThemeManager.initialize()
      
      // 测试 CSS 验证
      const validation = CustomThemeManager.validateCSSContent(SAMPLE_THEME_CSS)
      if (!validation.isValid) {
        console.error('CSS validation failed:', validation.errors)
        return false
      }
      
      // 测试 CSS 应用
      CustomThemeManager.applyCustomThemeCSS(SAMPLE_THEME_CSS)
      
      // 检查是否有激活的主题
      if (!CustomThemeManager.hasActiveCustomTheme()) {
        console.error('Custom theme not applied')
        return false
      }
      
      // 测试预览功能
      CustomThemeManager.previewThemeCSS(SAMPLE_THEME_CSS)
      
      if (!CustomThemeManager.hasActivePreview()) {
        console.error('Theme preview not applied')
        return false
      }
      
      // 清除预览
      CustomThemeManager.clearPreviewCSS()
      
      if (CustomThemeManager.hasActivePreview()) {
        console.error('Theme preview not cleared')
        return false
      }
      
      // 移除主题
      CustomThemeManager.removeCustomThemeCSS()
      
      if (CustomThemeManager.hasActiveCustomTheme()) {
        console.error('Custom theme not removed')
        return false
      }
      
      console.log('✅ CustomThemeManager tests passed')
      return true
    } catch (error) {
      console.error('❌ CustomThemeManager test failed:', error)
      return false
    }
  }

  /**
   * 测试 ThemeService 数据管理功能
   */
  static async testThemeService(): Promise<boolean> {
    console.log('Testing ThemeService...')
    
    try {
      // 测试获取主题列表（应该为空）
      const initialThemes = await ThemeService.getCustomThemes()
      console.log('Initial themes count:', initialThemes.length)
      
      // 测试保存主题
      const testTheme = await ThemeService.saveCustomTheme({
        name: 'Test Ocean Blue',
        description: 'A test theme for validation',
        author: 'Test Suite',
        cssContent: SAMPLE_THEME_CSS
      })
      
      console.log('Theme saved with ID:', testTheme.id)
      
      // 测试获取单个主题
      const retrievedTheme = await ThemeService.getCustomTheme(testTheme.id)
      if (!retrievedTheme || retrievedTheme.name !== testTheme.name) {
        console.error('Failed to retrieve saved theme')
        return false
      }
      
      // 测试主题列表
      const themesAfterSave = await ThemeService.getCustomThemes()
      if (themesAfterSave.length !== initialThemes.length + 1) {
        console.error('Theme count mismatch after save')
        return false
      }
      
      // 测试设置激活主题
      await ThemeService.setActiveCustomTheme(testTheme.id)
      const activeTheme = await ThemeService.getActiveCustomTheme()
      if (activeTheme !== testTheme.id) {
        console.error('Failed to set active theme')
        return false
      }
      
      // 测试主题名称重复检查
      const nameExists = await ThemeService.isThemeNameExists('Test Ocean Blue')
      if (!nameExists) {
        console.error('Theme name existence check failed')
        return false
      }
      
      // 测试导出主题
      const exportedJson = await ThemeService.exportTheme(testTheme.id)
      const exportedTheme = JSON.parse(exportedJson) as CustomTheme
      if (exportedTheme.name !== testTheme.name) {
        console.error('Theme export failed')
        return false
      }
      
      // 清理：删除测试主题
      await ThemeService.deleteCustomTheme(testTheme.id)
      
      // 验证删除
      const themesAfterDelete = await ThemeService.getCustomThemes()
      if (themesAfterDelete.length !== initialThemes.length) {
        console.error('Theme not properly deleted')
        return false
      }
      
      // 验证激活主题被清除
      const activeAfterDelete = await ThemeService.getActiveCustomTheme()
      if (activeAfterDelete !== null) {
        console.error('Active theme not cleared after deletion')
        return false
      }
      
      console.log('✅ ThemeService tests passed')
      return true
    } catch (error) {
      console.error('❌ ThemeService test failed:', error)
      return false
    }
  }

  /**
   * 运行完整的测试套件
   */
  static async runFullTestSuite(): Promise<boolean> {
    console.log('🧪 Starting Custom Theme Test Suite...')
    
    const managerTest = this.testCustomThemeManager()
    const serviceTest = await this.testThemeService()
    
    const allPassed = managerTest && serviceTest
    
    if (allPassed) {
      console.log('🎉 All tests passed! Custom theme system is working correctly.')
    } else {
      console.log('❌ Some tests failed. Please check the implementation.')
    }
    
    return allPassed
  }

  /**
   * 创建示例主题用于演示
   */
  static async createSampleThemes(): Promise<CustomTheme[]> {
    console.log('Creating sample themes for demonstration...')
    
    const sampleThemes = [
      {
        name: 'Ocean Blue',
        description: 'A calming blue theme inspired by the ocean',
        author: 'ClarityFile Team',
        cssContent: SAMPLE_THEME_CSS
      },
      {
        name: 'Forest Green',
        description: 'A natural green theme inspired by forests',
        author: 'ClarityFile Team',
        cssContent: `
:root {
  --background: oklch(0.98 0.02 140);
  --foreground: oklch(0.15 0.05 140);
  --primary: oklch(0.45 0.15 140);
  --primary-foreground: oklch(0.98 0.02 140);
}
.dark {
  --background: oklch(0.08 0.02 140);
  --foreground: oklch(0.95 0.02 140);
  --primary: oklch(0.65 0.15 140);
  --primary-foreground: oklch(0.08 0.02 140);
}
        `
      }
    ]
    
    const createdThemes: CustomTheme[] = []
    
    for (const themeData of sampleThemes) {
      try {
        const theme = await ThemeService.saveCustomTheme(themeData)
        createdThemes.push(theme)
        console.log(`✅ Created sample theme: ${theme.name}`)
      } catch (error) {
        console.error(`❌ Failed to create sample theme: ${themeData.name}`, error)
      }
    }
    
    return createdThemes
  }
}

// 在开发环境中自动运行测试
if (import.meta.env.DEV) {
  // 延迟执行，确保应用初始化完成
  setTimeout(() => {
    ThemeTestSuite.runFullTestSuite().catch(console.error)
  }, 2000)
}
