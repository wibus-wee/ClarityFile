/**
 * 主题色彩提取工具
 * 从CSS内容中提取主要颜色用于预览
 */

export interface ThemeColorPalette {
  primary: string
  secondary: string
  background: string
  foreground: string
  accent: string
  muted: string
}

export interface ExtractedColors {
  light: ThemeColorPalette
  dark: ThemeColorPalette
}

export class ThemeColorExtractor {
  /**
   * 从CSS内容中提取主题颜色
   */
  static extractColors(cssContent: string): ExtractedColors {
    const lightColors = this.extractColorsFromMode(cssContent, 'light')
    const darkColors = this.extractColorsFromMode(cssContent, 'dark')

    return {
      light: lightColors,
      dark: darkColors
    }
  }

  /**
   * 从特定模式中提取颜色
   */
  private static extractColorsFromMode(
    cssContent: string,
    mode: 'light' | 'dark'
  ): ThemeColorPalette {
    const selectorRegex = mode === 'light' ? /:root\s*{([^}]*)}/g : /\.dark\s*{([^}]*)}/g

    let selectorContent = ''
    let match: RegExpExecArray | null

    // 提取对应选择器的内容
    while ((match = selectorRegex.exec(cssContent)) !== null) {
      selectorContent += match[1]
    }

    if (!selectorContent) {
      // 如果没有找到对应选择器，返回默认颜色
      return this.getDefaultColors(mode)
    }

    return {
      primary:
        this.extractVariable(selectorContent, '--primary') || this.getDefaultColor('primary', mode),
      secondary:
        this.extractVariable(selectorContent, '--secondary') ||
        this.getDefaultColor('secondary', mode),
      background:
        this.extractVariable(selectorContent, '--background') ||
        this.getDefaultColor('background', mode),
      foreground:
        this.extractVariable(selectorContent, '--foreground') ||
        this.getDefaultColor('foreground', mode),
      accent:
        this.extractVariable(selectorContent, '--accent') || this.getDefaultColor('accent', mode),
      muted: this.extractVariable(selectorContent, '--muted') || this.getDefaultColor('muted', mode)
    }
  }

  /**
   * 提取CSS变量值
   */
  private static extractVariable(cssContent: string, variableName: string): string | null {
    const regex = new RegExp(`${variableName}\\s*:\\s*([^;]+);`, 'i')
    const match = cssContent.match(regex)

    if (match && match[1]) {
      const value = match[1].trim()
      return this.convertToHex(value)
    }

    return null
  }

  /**
   * 将各种颜色格式转换为十六进制
   */
  private static convertToHex(colorValue: string): string {
    // 移除注释
    colorValue = colorValue.replace(/\/\*.*?\*\//g, '').trim()

    // 如果已经是十六进制，直接返回
    if (colorValue.startsWith('#')) {
      return colorValue
    }

    // 处理 oklch 格式
    if (colorValue.startsWith('oklch(')) {
      return this.oklchToHex(colorValue)
    }

    // 处理 hsl 格式
    if (colorValue.startsWith('hsl(')) {
      return this.hslToHex(colorValue)
    }

    // 处理 rgb 格式
    if (colorValue.startsWith('rgb(')) {
      return this.rgbToHex(colorValue)
    }

    // 处理命名颜色
    const namedColors: Record<string, string> = {
      white: '#ffffff',
      black: '#000000',
      transparent: '#00000000'
    }

    if (namedColors[colorValue.toLowerCase()]) {
      return namedColors[colorValue.toLowerCase()]
    }

    // 如果无法识别，返回默认颜色
    return '#888888'
  }

  /**
   * 将 oklch 转换为十六进制
   */
  private static oklchToHex(oklchValue: string): string {
    const match = oklchValue.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/)

    if (match) {
      const l = parseFloat(match[1])
      const c = parseFloat(match[2])
      const h = parseFloat(match[3])

      // 更准确的 OKLCH 到 RGB 转换
      return this.oklchToRgbHex(l, c, h)
    }

    return '#888888'
  }

  /**
   * OKLCH 到 RGB 的转换
   * 使用简化但更准确的色相映射
   */
  private static oklchToRgbHex(l: number, c: number, h: number): string {
    // 亮度映射 (0-1)
    const lightness = Math.max(0, Math.min(1, l))

    // 如果没有色度，返回灰度
    if (c <= 0) {
      const gray = Math.round(lightness * 255)
      const hex = gray.toString(16).padStart(2, '0')
      return `#${hex}${hex}${hex}`
    }

    // 色度强度 (调整映射以获得更好的视觉效果)
    const intensity = Math.min(1, c * 3)

    // 将色相标准化到 0-360 范围
    const normalizedHue = ((h % 360) + 360) % 360

    // 使用 HSL 风格的色相到 RGB 转换
    const hue60 = normalizedHue / 60
    const sector = Math.floor(hue60)
    const fraction = hue60 - sector

    // 计算基础颜色分量
    const p = lightness * (1 - intensity)
    const q = lightness * (1 - intensity * fraction)
    const t = lightness * (1 - intensity * (1 - fraction))
    const v = lightness

    let r: number, g: number, b: number

    switch (sector) {
      case 0: // 红到黄 (0-60°)
        r = v
        g = t
        b = p
        break
      case 1: // 黄到绿 (60-120°)
        r = q
        g = v
        b = p
        break
      case 2: // 绿到青 (120-180°)
        r = p
        g = v
        b = t
        break
      case 3: // 青到蓝 (180-240°)
        r = p
        g = q
        b = v
        break
      case 4: // 蓝到紫 (240-300°)
        r = t
        g = p
        b = v
        break
      case 5: // 紫到红 (300-360°)
      default:
        r = v
        g = p
        b = q
        break
    }

    // 确保值在有效范围内并转换为整数
    const rInt = Math.round(Math.max(0, Math.min(1, r)) * 255)
    const gInt = Math.round(Math.max(0, Math.min(1, g)) * 255)
    const bInt = Math.round(Math.max(0, Math.min(1, b)) * 255)

    return `#${rInt.toString(16).padStart(2, '0')}${gInt.toString(16).padStart(2, '0')}${bInt.toString(16).padStart(2, '0')}`
  }

  /**
   * 将 hsl 转换为十六进制
   */
  private static hslToHex(hslValue: string): string {
    const match = hslValue.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/)

    if (match) {
      const h = parseFloat(match[1]) / 360
      const s = parseFloat(match[2]) / 100
      const l = parseFloat(match[3]) / 100

      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
      const m = l - c / 2

      let r = 0,
        g = 0,
        b = 0

      if (h < 1 / 6) {
        r = c
        g = x
        b = 0
      } else if (h < 2 / 6) {
        r = x
        g = c
        b = 0
      } else if (h < 3 / 6) {
        r = 0
        g = c
        b = x
      } else if (h < 4 / 6) {
        r = 0
        g = x
        b = c
      } else if (h < 5 / 6) {
        r = x
        g = 0
        b = c
      } else {
        r = c
        g = 0
        b = x
      }

      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }

    return '#888888'
  }

  /**
   * 将 rgb 转换为十六进制
   */
  private static rgbToHex(rgbValue: string): string {
    const match = rgbValue.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)

    if (match) {
      const r = parseInt(match[1])
      const g = parseInt(match[2])
      const b = parseInt(match[3])

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }

    return '#888888'
  }

  /**
   * 获取默认颜色
   */
  private static getDefaultColor(
    colorType: keyof ThemeColorPalette,
    mode: 'light' | 'dark'
  ): string {
    const defaultColors = {
      light: {
        primary: '#000000',
        secondary: '#f5f5f5',
        background: '#ffffff',
        foreground: '#000000',
        accent: '#f5f5f5',
        muted: '#f5f5f5'
      },
      dark: {
        primary: '#ffffff',
        secondary: '#262626',
        background: '#000000',
        foreground: '#ffffff',
        accent: '#262626',
        muted: '#262626'
      }
    }

    return defaultColors[mode][colorType]
  }

  /**
   * 获取默认颜色调色板
   */
  private static getDefaultColors(mode: 'light' | 'dark'): ThemeColorPalette {
    return {
      primary: this.getDefaultColor('primary', mode),
      secondary: this.getDefaultColor('secondary', mode),
      background: this.getDefaultColor('background', mode),
      foreground: this.getDefaultColor('foreground', mode),
      accent: this.getDefaultColor('accent', mode),
      muted: this.getDefaultColor('muted', mode)
    }
  }

  /**
   * 生成主题预览色彩数组（用于显示）
   */
  static getPreviewColors(cssContent: string): string[] {
    const colors = this.extractColors(cssContent)

    // 返回最具代表性的颜色用于预览
    return [
      colors.light.primary,
      colors.light.secondary,
      colors.light.accent,
      colors.dark.primary,
      colors.dark.background
    ].filter((color, index, arr) => arr.indexOf(color) === index) // 去重
  }
}
