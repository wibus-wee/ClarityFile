/**
 * FontParser - 智能字体解析和映射工具
 *
 * 功能：
 * 1. 自动解析CSS中的字体引用
 * 2. 维护字体到Google Fonts的映射
 * 3. 按需生成字体链接
 * 4. 支持字体权重和样式解析
 */

export interface FontInfo {
  family: string
  weights?: string[]
  styles?: string[]
  source: 'google' | 'system' | 'custom'
  displayName: string
}

export interface ParsedFont {
  family: string
  weights: Set<string>
  styles: Set<string>
  source: 'google' | 'system' | 'custom'
}

export interface FontParseResult {
  fonts: ParsedFont[]
  googleFontsUrl?: string
  systemFonts: string[]
  customFonts: string[]
}

export class FontParser {
  // Google Fonts 映射数据库（常用字体）
  private static readonly GOOGLE_FONTS_MAP: Record<string, FontInfo> = {
    // Sans-serif 字体
    Inter: {
      family: 'Inter',
      source: 'google',
      displayName: 'Inter',
      weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      styles: ['normal', 'italic']
    },
    'Open Sans': {
      family: 'Open+Sans',
      source: 'google',
      displayName: 'Open Sans',
      weights: ['300', '400', '500', '600', '700', '800'],
      styles: ['normal', 'italic']
    },
    Roboto: {
      family: 'Roboto',
      source: 'google',
      displayName: 'Roboto',
      weights: ['100', '300', '400', '500', '700', '900'],
      styles: ['normal', 'italic']
    },
    Poppins: {
      family: 'Poppins',
      source: 'google',
      displayName: 'Poppins',
      weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      styles: ['normal', 'italic']
    },
    Montserrat: {
      family: 'Montserrat',
      source: 'google',
      displayName: 'Montserrat',
      weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      styles: ['normal', 'italic']
    },
    Lato: {
      family: 'Lato',
      source: 'google',
      displayName: 'Lato',
      weights: ['100', '300', '400', '700', '900'],
      styles: ['normal', 'italic']
    },
    Nunito: {
      family: 'Nunito',
      source: 'google',
      displayName: 'Nunito',
      weights: ['200', '300', '400', '500', '600', '700', '800', '900'],
      styles: ['normal', 'italic']
    },
    'Source Sans Pro': {
      family: 'Source+Sans+Pro',
      source: 'google',
      displayName: 'Source Sans Pro',
      weights: ['200', '300', '400', '600', '700', '900'],
      styles: ['normal', 'italic']
    },
    Geist: {
      family: 'Geist',
      source: 'google',
      displayName: 'Geist',
      weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      styles: ['normal']
    },
    'Plus Jakarta Sans': {
      family: 'Plus+Jakarta+Sans',
      source: 'google',
      displayName: 'Plus Jakarta Sans',
      weights: ['200', '300', '400', '500', '600', '700', '800'],
      styles: ['normal', 'italic']
    },
    'DM Sans': {
      family: 'DM+Sans',
      source: 'google',
      displayName: 'DM Sans',
      weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      styles: ['normal', 'italic']
    },
    'Space Grotesk': {
      family: 'Space+Grotesk',
      source: 'google',
      displayName: 'Space Grotesk',
      weights: ['300', '400', '500', '600', '700'],
      styles: ['normal']
    },
    Outfit: {
      family: 'Outfit',
      source: 'google',
      displayName: 'Outfit',
      weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      styles: ['normal']
    },

    // Serif 字体
    'Playfair Display': {
      family: 'Playfair+Display',
      source: 'google',
      displayName: 'Playfair Display',
      weights: ['400', '500', '600', '700', '800', '900'],
      styles: ['normal', 'italic']
    },
    Merriweather: {
      family: 'Merriweather',
      source: 'google',
      displayName: 'Merriweather',
      weights: ['300', '400', '700', '900'],
      styles: ['normal', 'italic']
    },
    Lora: {
      family: 'Lora',
      source: 'google',
      displayName: 'Lora',
      weights: ['400', '500', '600', '700'],
      styles: ['normal', 'italic']
    },
    'Source Serif Pro': {
      family: 'Source+Serif+Pro',
      source: 'google',
      displayName: 'Source Serif Pro',
      weights: ['200', '300', '400', '600', '700', '900'],
      styles: ['normal', 'italic']
    },
    'Libre Baskerville': {
      family: 'Libre+Baskerville',
      source: 'google',
      displayName: 'Libre Baskerville',
      weights: ['400', '700'],
      styles: ['normal', 'italic']
    },
    'Crimson Text': {
      family: 'Crimson+Text',
      source: 'google',
      displayName: 'Crimson Text',
      weights: ['400', '600', '700'],
      styles: ['normal', 'italic']
    },

    // Monospace 字体
    'JetBrains Mono': {
      family: 'JetBrains+Mono',
      source: 'google',
      displayName: 'JetBrains Mono',
      weights: ['100', '200', '300', '400', '500', '600', '700', '800'],
      styles: ['normal', 'italic']
    },
    'Fira Code': {
      family: 'Fira+Code',
      source: 'google',
      displayName: 'Fira Code',
      weights: ['300', '400', '500', '600', '700'],
      styles: ['normal']
    },
    'Source Code Pro': {
      family: 'Source+Code+Pro',
      source: 'google',
      displayName: 'Source Code Pro',
      weights: ['200', '300', '400', '500', '600', '700', '800', '900'],
      styles: ['normal', 'italic']
    },
    'Roboto Mono': {
      family: 'Roboto+Mono',
      source: 'google',
      displayName: 'Roboto Mono',
      weights: ['100', '200', '300', '400', '500', '600', '700'],
      styles: ['normal', 'italic']
    },
    'IBM Plex Mono': {
      family: 'IBM+Plex+Mono',
      source: 'google',
      displayName: 'IBM Plex Mono',
      weights: ['100', '200', '300', '400', '500', '600', '700'],
      styles: ['normal', 'italic']
    },
    'Space Mono': {
      family: 'Space+Mono',
      source: 'google',
      displayName: 'Space Mono',
      weights: ['400', '700'],
      styles: ['normal', 'italic']
    },
    'Geist Mono': {
      family: 'Geist+Mono',
      source: 'google',
      displayName: 'Geist Mono',
      weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      styles: ['normal']
    },
    Inconsolata: {
      family: 'Inconsolata',
      source: 'google',
      displayName: 'Inconsolata',
      weights: ['200', '300', '400', '500', '600', '700', '800', '900'],
      styles: ['normal']
    },

    // 特殊字体
    Oxanium: {
      family: 'Oxanium',
      source: 'google',
      displayName: 'Oxanium',
      weights: ['200', '300', '400', '500', '600', '700', '800'],
      styles: ['normal']
    },
    'Architects Daughter': {
      family: 'Architects+Daughter',
      source: 'google',
      displayName: 'Architects Daughter',
      weights: ['400'],
      styles: ['normal']
    }
  }

  // 系统字体列表
  private static readonly SYSTEM_FONTS = [
    'Arial',
    'Helvetica',
    'Times',
    'Times New Roman',
    'Courier',
    'Courier New',
    'Verdana',
    'Georgia',
    'Palatino',
    'Garamond',
    'Bookman',
    'Comic Sans MS',
    'Trebuchet MS',
    'Arial Black',
    'Impact',
    'Lucida Console',
    'Tahoma',
    'Monaco',
    'Menlo',
    'Consolas',
    'DejaVu Sans',
    'DejaVu Serif',
    'DejaVu Sans Mono',
    // macOS 系统字体
    'San Francisco',
    'SF Pro Display',
    'SF Pro Text',
    'SF Mono',
    'New York',
    // Windows 系统字体
    'Segoe UI',
    'Segoe UI Historic',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    // 通用字体族
    'serif',
    'sans-serif',
    'monospace',
    'cursive',
    'fantasy',
    'system-ui'
  ]

  /**
   * 解析CSS内容中的字体引用
   */
  static parseFontsFromCSS(cssContent: string): FontParseResult {
    const fonts = new Map<string, ParsedFont>()
    const systemFonts: string[] = []
    const customFonts: string[] = []

    // 匹配字体相关的CSS属性
    const fontPatterns = [/font-family\s*:\s*([^;]+)/gi, /--[\w-]*font[\w-]*\s*:\s*([^;]+)/gi]

    fontPatterns.forEach((pattern) => {
      let match: RegExpExecArray | null
      while ((match = pattern.exec(cssContent)) !== null) {
        const fontValue = match[1].trim()
        this.extractFontFamilies(fontValue).forEach((family) => {
          const cleanFamily = this.cleanFontName(family)
          if (cleanFamily) {
            this.categorizeFontFamily(cleanFamily, fonts, systemFonts, customFonts)
          }
        })
      }
    })

    // 生成Google Fonts URL
    const googleFontsUrl = this.generateGoogleFontsUrl(
      Array.from(fonts.values()).filter((f) => f.source === 'google')
    )

    return {
      fonts: Array.from(fonts.values()),
      googleFontsUrl,
      systemFonts: [...new Set(systemFonts)],
      customFonts: [...new Set(customFonts)]
    }
  }

  /**
   * 从字体值中提取字体族名称
   */
  private static extractFontFamilies(fontValue: string): string[] {
    // 移除注释和多余空格
    let cleaned = fontValue.replace(/\/\*.*?\*\//g, '').trim()

    // 移除CSS函数（如 var(), calc() 等）
    cleaned = cleaned.replace(/var\([^)]+\)/g, '')
    cleaned = cleaned.replace(/calc\([^)]+\)/g, '')
    cleaned = cleaned.replace(/rgb\([^)]+\)/g, '')
    cleaned = cleaned.replace(/rgba\([^)]+\)/g, '')
    cleaned = cleaned.replace(/hsl\([^)]+\)/g, '')
    cleaned = cleaned.replace(/hsla\([^)]+\)/g, '')
    cleaned = cleaned.replace(/url\([^)]+\)/g, '')

    // 处理font简写属性（如 "bold 16px/1.5 Arial, sans-serif"）
    // 如果包含px、em、rem、%等单位，说明是font简写，需要提取最后的字体族部分
    if (/\d+(px|em|rem|%|pt|pc|in|cm|mm|ex|ch|vw|vh|vmin|vmax)/.test(cleaned)) {
      // 找到最后一个数字+单位后的部分作为字体族
      const match = cleaned.match(
        /\d+(?:px|em|rem|%|pt|pc|in|cm|mm|ex|ch|vw|vh|vmin|vmax)[^,]*(.+)/
      )
      if (match && match[1]) {
        cleaned = match[1].trim()
      }
    }

    // 分割字体族（以逗号分隔）
    const families = cleaned.split(',').map((f) => f.trim())

    return families.filter((f) => f.length > 0)
  }

  /**
   * 清理字体名称（移除引号、处理特殊字符等）
   */
  private static cleanFontName(fontName: string): string {
    const cleaned = fontName
      .replace(/['"]/g, '') // 移除引号
      .replace(/\s+/g, ' ') // 标准化空格
      .trim()

    // 过滤掉CSS变量、函数和无效值
    if (
      cleaned.startsWith('var(') ||
      cleaned.includes('var(') ||
      cleaned.startsWith('calc(') ||
      cleaned.startsWith('rgb(') ||
      cleaned.startsWith('rgba(') ||
      cleaned.startsWith('hsl(') ||
      cleaned.startsWith('hsla(') ||
      cleaned.startsWith('url(') ||
      cleaned.startsWith('inherit') ||
      cleaned.startsWith('initial') ||
      cleaned.startsWith('unset') ||
      cleaned.startsWith('revert') ||
      cleaned.startsWith('none') ||
      cleaned.includes('!important') ||
      /^\d/.test(cleaned) || // 以数字开头
      (cleaned.includes('(') && cleaned.includes(')')) // 包含函数调用
    ) {
      return ''
    }

    return cleaned
  }

  /**
   * 分类字体族（Google Fonts、系统字体、自定义字体）
   */
  private static categorizeFontFamily(
    family: string,
    fonts: Map<string, ParsedFont>,
    systemFonts: string[],
    customFonts: string[]
  ): void {
    // 检查是否为Google Fonts
    if (this.GOOGLE_FONTS_MAP[family]) {
      if (!fonts.has(family)) {
        const fontInfo = this.GOOGLE_FONTS_MAP[family]
        fonts.set(family, {
          family,
          weights: new Set(fontInfo?.weights || ['400']), // 使用所有可用权重
          styles: new Set(fontInfo?.styles || ['normal']), // 使用所有可用样式
          source: 'google'
        })
      }
      return
    }

    // 检查是否为系统字体
    if (this.SYSTEM_FONTS.includes(family)) {
      systemFonts.push(family)
      return
    }

    // 其他情况视为自定义字体
    customFonts.push(family)
  }

  /**
   * 生成Google Fonts URL
   */
  private static generateGoogleFontsUrl(googleFonts: ParsedFont[]): string | undefined {
    if (googleFonts.length === 0) return undefined

    const families: string[] = []

    googleFonts.forEach((font) => {
      const fontInfo = this.GOOGLE_FONTS_MAP[font.family]
      if (!fontInfo) return

      const weights = Array.from(font.weights).sort()
      const styles = Array.from(font.styles)

      let familyParam = fontInfo.family

      // 使用更简洁的权重范围语法
      if (weights.length > 0 || styles.includes('italic')) {
        const minWeight = Math.min(...weights.map((w) => parseInt(w)))
        const maxWeight = Math.max(...weights.map((w) => parseInt(w)))

        if (styles.includes('italic')) {
          // 包含斜体，使用 ital,wght 语法
          familyParam += `:ital,wght@0,${minWeight}..${maxWeight};1,${minWeight}..${maxWeight}`
        } else {
          // 只有正常样式，使用 wght 范围
          familyParam += `:wght@${minWeight}..${maxWeight}`
        }
      }

      families.push(familyParam)
    })

    if (families.length === 0) return undefined

    const url = new URL('https://fonts.googleapis.com/css2')
    families.forEach((family) => {
      url.searchParams.append('family', family)
    })
    url.searchParams.set('display', 'swap')

    return url.toString()
  }

  /**
   * 获取支持的Google Fonts列表
   */
  static getSupportedGoogleFonts(): FontInfo[] {
    return Object.values(this.GOOGLE_FONTS_MAP)
  }

  /**
   * 检查字体是否为Google Fonts
   */
  static isGoogleFont(fontFamily: string): boolean {
    return fontFamily in this.GOOGLE_FONTS_MAP
  }

  /**
   * 检查字体是否为系统字体
   */
  static isSystemFont(fontFamily: string): boolean {
    return this.SYSTEM_FONTS.includes(fontFamily)
  }

  /**
   * 获取字体的显示名称
   */
  static getFontDisplayName(fontFamily: string): string {
    const googleFont = this.GOOGLE_FONTS_MAP[fontFamily]
    if (googleFont) {
      return googleFont.displayName
    }
    return fontFamily
  }
}
