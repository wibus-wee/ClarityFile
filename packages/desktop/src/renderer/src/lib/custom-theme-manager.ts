/**
 * CustomThemeManager - 自定义主题 CSS 注入管理器
 *
 * 负责动态注入和移除自定义主题的 CSS 样式
 * 支持智能字体解析和按需加载
 * 按照 RFC 设计，直接将 CSS 内容 append 到页面 head 中
 */

import { FontParser } from './font-parser'

export class CustomThemeManager {
  private static readonly STYLE_ID = 'custom-theme-styles'
  private static readonly PREVIEW_STYLE_ID = 'custom-theme-preview-styles'
  private static readonly FONT_LINKS_ID = 'custom-theme-font-links'
  private static readonly PREVIEW_FONT_LINKS_ID = 'custom-theme-preview-font-links'

  private static customThemeStyleElement: HTMLStyleElement | null = null
  private static previewStyleElement: HTMLStyleElement | null = null
  private static fontLinksContainer: HTMLElement | null = null
  private static previewFontLinksContainer: HTMLElement | null = null

  /**
   * 应用自定义主题 CSS
   * @param cssContent CSS 内容字符串
   */
  static applyCustomThemeCSS(cssContent: string): void {
    try {
      // 移除之前的自定义主题样式
      this.removeCustomThemeCSS()

      // 智能解析CSS中的字体并应用
      const fontParseResult = FontParser.parseFontsFromCSS(cssContent)
      if (fontParseResult.googleFontsUrl) {
        this.applyFontLinks([fontParseResult.googleFontsUrl], false)
      }

      // 创建新的 style 元素
      const styleElement = document.createElement('style')
      styleElement.id = this.STYLE_ID
      styleElement.textContent = cssContent

      // 插入到 head 的最后，确保优先级最高
      document.head.appendChild(styleElement)
      this.customThemeStyleElement = styleElement

      console.log('Custom theme CSS applied successfully')
      if (fontParseResult.googleFontsUrl) {
        console.log(
          'Auto-detected fonts:',
          fontParseResult.fonts.map((f) => f.family)
        )
        console.log('Generated Google Fonts URL:', fontParseResult.googleFontsUrl)
      }
    } catch (error) {
      console.error('Failed to apply custom theme CSS:', error)
      throw new Error('应用自定义主题失败')
    }
  }

  /**
   * 移除自定义主题 CSS
   */
  static removeCustomThemeCSS(): void {
    try {
      if (this.customThemeStyleElement) {
        this.customThemeStyleElement.remove()
        this.customThemeStyleElement = null
        console.log('Custom theme CSS removed')
      }

      // 同时移除可能存在的旧样式元素（通过 ID 查找）
      const existingStyle = document.getElementById(this.STYLE_ID)
      if (existingStyle) {
        existingStyle.remove()
      }

      // 移除字体链接
      this.removeFontLinks(false)
    } catch (error) {
      console.error('Failed to remove custom theme CSS:', error)
    }
  }

  /**
   * 预览主题 CSS（临时应用，不影响正式主题）
   * @param cssContent CSS 内容字符串
   */
  static previewThemeCSS(cssContent: string): void {
    try {
      // 移除之前的预览样式
      this.clearPreviewCSS()

      // 智能解析CSS中的字体并应用预览
      const fontParseResult = FontParser.parseFontsFromCSS(cssContent)
      if (fontParseResult.googleFontsUrl) {
        this.applyFontLinks([fontParseResult.googleFontsUrl], true)
      }

      // 创建预览样式元素
      const previewElement = document.createElement('style')
      previewElement.id = this.PREVIEW_STYLE_ID
      previewElement.textContent = cssContent

      // 插入到 head 的最后，确保优先级最高
      document.head.appendChild(previewElement)
      this.previewStyleElement = previewElement

      console.log('Theme preview applied')
      if (fontParseResult.googleFontsUrl) {
        console.log(
          'Preview auto-detected fonts:',
          fontParseResult.fonts.map((f) => f.family)
        )
      }
    } catch (error) {
      console.error('Failed to apply theme preview:', error)
      throw new Error('预览主题失败')
    }
  }

  /**
   * 清除主题预览
   */
  static clearPreviewCSS(): void {
    try {
      if (this.previewStyleElement) {
        this.previewStyleElement.remove()
        this.previewStyleElement = null
        console.log('Theme preview cleared')
      }

      // 同时移除可能存在的旧预览样式元素
      const existingPreview = document.getElementById(this.PREVIEW_STYLE_ID)
      if (existingPreview) {
        existingPreview.remove()
      }

      // 移除预览字体链接
      this.removeFontLinks(true)
    } catch (error) {
      console.error('Failed to clear theme preview:', error)
    }
  }

  /**
   * 应用字体链接
   * @param fontLinks 字体链接数组
   * @param isPreview 是否为预览模式
   */
  static applyFontLinks(fontLinks: string[], isPreview: boolean = false): void {
    try {
      // 移除之前的字体链接
      this.removeFontLinks(isPreview)

      if (!fontLinks || fontLinks.length === 0) {
        return
      }

      // 优化Google Fonts链接
      const optimizedLinks = this.optimizeGoogleFontsLinks(fontLinks)

      // 创建容器元素
      const container = document.createElement('div')
      container.id = isPreview ? this.PREVIEW_FONT_LINKS_ID : this.FONT_LINKS_ID
      container.style.display = 'none' // 隐藏容器

      // 为每个链接创建link元素
      optimizedLinks.forEach((linkUrl, index) => {
        const linkElement = document.createElement('link')
        linkElement.rel = 'stylesheet'
        linkElement.href = linkUrl
        linkElement.setAttribute('data-font-index', index.toString())

        // 添加preconnect链接以提高性能
        if (linkUrl.includes('fonts.googleapis.com')) {
          const preconnect1 = document.createElement('link')
          preconnect1.rel = 'preconnect'
          preconnect1.href = 'https://fonts.googleapis.com'

          const preconnect2 = document.createElement('link')
          preconnect2.rel = 'preconnect'
          preconnect2.href = 'https://fonts.gstatic.com'
          preconnect2.crossOrigin = 'anonymous'

          container.appendChild(preconnect1)
          container.appendChild(preconnect2)
        }

        container.appendChild(linkElement)
      })

      // 插入到head中
      document.head.appendChild(container)

      if (isPreview) {
        this.previewFontLinksContainer = container
      } else {
        this.fontLinksContainer = container
      }

      console.log(`Font links applied (${isPreview ? 'preview' : 'theme'}):`, optimizedLinks)
    } catch (error) {
      console.error('Failed to apply font links:', error)
      throw new Error('应用字体链接失败')
    }
  }

  /**
   * 移除字体链接
   * @param isPreview 是否为预览模式
   */
  static removeFontLinks(isPreview: boolean = false): void {
    try {
      const container = isPreview ? this.previewFontLinksContainer : this.fontLinksContainer
      const containerId = isPreview ? this.PREVIEW_FONT_LINKS_ID : this.FONT_LINKS_ID

      if (container) {
        container.remove()
        if (isPreview) {
          this.previewFontLinksContainer = null
        } else {
          this.fontLinksContainer = null
        }
        console.log(`Font links removed (${isPreview ? 'preview' : 'theme'})`)
      }

      // 同时移除可能存在的旧容器元素
      const existingContainer = document.getElementById(containerId)
      if (existingContainer) {
        existingContainer.remove()
      }
    } catch (error) {
      console.error('Failed to remove font links:', error)
    }
  }

  /**
   * 优化Google Fonts链接，合并多个字体到单个请求
   * @param fontLinks 原始字体链接数组
   */
  static optimizeGoogleFontsLinks(fontLinks: string[]): string[] {
    const googleFontsLinks: string[] = []
    const otherLinks: string[] = []
    const googleFontsFamilies: string[] = []

    fontLinks.forEach((link) => {
      if (link.includes('fonts.googleapis.com/css')) {
        // 提取Google Fonts的family参数
        try {
          const url = new URL(link)
          const family = url.searchParams.get('family')
          if (family) {
            googleFontsFamilies.push(family)
          } else {
            googleFontsLinks.push(link)
          }
        } catch {
          googleFontsLinks.push(link)
        }
      } else {
        otherLinks.push(link)
      }
    })

    // 如果有多个Google Fonts family，合并为单个请求
    if (googleFontsFamilies.length > 0) {
      const combinedUrl = new URL('https://fonts.googleapis.com/css2')
      combinedUrl.searchParams.set('family', googleFontsFamilies.join('&family='))
      combinedUrl.searchParams.set('display', 'swap')
      googleFontsLinks.unshift(combinedUrl.toString())
    }

    return [...googleFontsLinks, ...otherLinks]
  }

  /**
   * 检查是否有自定义主题正在应用
   */
  static hasActiveCustomTheme(): boolean {
    return this.customThemeStyleElement !== null || document.getElementById(this.STYLE_ID) !== null
  }

  /**
   * 检查是否有主题预览正在显示
   */
  static hasActivePreview(): boolean {
    return (
      this.previewStyleElement !== null || document.getElementById(this.PREVIEW_STYLE_ID) !== null
    )
  }

  /**
   * 获取当前应用的自定义主题 CSS 内容
   */
  static getCurrentCustomThemeCSS(): string | null {
    if (this.customThemeStyleElement) {
      return this.customThemeStyleElement.textContent
    }

    const existingStyle = document.getElementById(this.STYLE_ID) as HTMLStyleElement
    return existingStyle?.textContent || null
  }

  /**
   * 验证 CSS 内容的基本格式
   * @param cssContent CSS 内容字符串
   */
  static validateCSSContent(cssContent: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!cssContent || typeof cssContent !== 'string') {
      errors.push('CSS 内容不能为空')
      return { isValid: false, errors }
    }

    if (cssContent.trim().length === 0) {
      errors.push('CSS 内容不能只包含空格')
      return { isValid: false, errors }
    }

    // 检查是否包含潜在的危险内容
    const dangerousPatterns = [
      /@import/i,
      /javascript:/i,
      /expression\(/i,
      /behavior:/i,
      /binding:/i
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(cssContent)) {
        errors.push(`CSS 内容包含不安全的代码: ${pattern.source}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 清理和规范化 CSS 内容
   * @param cssContent 原始 CSS 内容
   */
  static sanitizeCSS(cssContent: string): string {
    if (!cssContent) return ''

    // 移除潜在的危险内容
    const sanitized = cssContent
      .replace(/@import[^;]+;/gi, '') // 移除 @import
      .replace(/javascript:[^;'"]+/gi, '') // 移除 javascript: 协议
      .replace(/expression\([^)]*\)/gi, '') // 移除 expression()
      .replace(/behavior:[^;]+;/gi, '') // 移除 behavior
      .replace(/binding:[^;]+;/gi, '') // 移除 binding

    return sanitized.trim()
  }

  /**
   * 初始化主题管理器（在应用启动时调用）
   */
  static initialize(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('CustomThemeManager initialized')
    }

    // 清理可能残留的样式元素和字体链接
    this.removeCustomThemeCSS()
    this.clearPreviewCSS()
    this.removeFontLinks(false)
    this.removeFontLinks(true)
  }

  /**
   * 销毁主题管理器（在应用关闭时调用）
   */
  static destroy(): void {
    this.removeCustomThemeCSS()
    this.clearPreviewCSS()
    this.removeFontLinks(false)
    this.removeFontLinks(true)
    if (process.env.NODE_ENV === 'development') {
      console.log('CustomThemeManager destroyed')
    }
  }
}
