export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'
export type ExtendedTheme = Theme | `custom:${string}`

// 自定义主题数据结构
export interface CustomTheme {
  id: string
  name: string
  description?: string
  author?: string
  cssContent: string
  createdAt: string
  updatedAt: string
}

// 自定义主题设置存储结构
export interface CustomThemeSettings {
  'appearance.customThemes': Record<string, CustomTheme>
  'appearance.activeCustomTheme': string | null
}

export interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  systemTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isLoading: boolean
}

// 扩展的主题上下文值，包含自定义主题功能
export interface ExtendedThemeContextValue extends ThemeContextValue {
  customThemes: CustomTheme[]
  activeCustomTheme: string | null
  applyCustomTheme: (themeId: string) => Promise<void>
  removeCustomTheme: (themeId: string) => Promise<void>
  saveCustomTheme: (
    theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<CustomTheme>
  updateCustomTheme: (
    themeId: string,
    updates: Partial<Omit<CustomTheme, 'id' | 'createdAt'>>
  ) => Promise<CustomTheme>
  previewTheme: (cssContent: string) => void
  clearPreview: () => void
  switchToDefaultTheme: () => Promise<void>
}
