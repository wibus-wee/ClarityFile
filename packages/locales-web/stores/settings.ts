import { defineStore } from 'pinia'
import { useDark, useToggle, useStorage } from '@vueuse/core'
import type { AppSettings, SettingsState } from '~/types'

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  interfaceLanguage: 'zh-CN',
  autoSave: true,
  showKeyPaths: true,
  baseLanguage: 'zh-CN',
  prettyPrint: true
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    theme: DEFAULT_SETTINGS.theme,
    interfaceLanguage: DEFAULT_SETTINGS.interfaceLanguage,
    autoSave: DEFAULT_SETTINGS.autoSave,
    showKeyPaths: DEFAULT_SETTINGS.showKeyPaths,
    baseLanguage: DEFAULT_SETTINGS.baseLanguage,
    prettyPrint: DEFAULT_SETTINGS.prettyPrint,
    isDark: false
  }),

  actions: {
    // 初始化设置（在客户端调用）
    initializeSettings() {
      if (import.meta.client) {
        // 使用 VueUse 的 useStorage 来同步持久化设置
        const themeStorage = useStorage('locales-editor-theme', DEFAULT_SETTINGS.theme)
        const interfaceLanguageStorage = useStorage(
          'locales-editor-interface-language',
          DEFAULT_SETTINGS.interfaceLanguage
        )
        const autoSaveStorage = useStorage('locales-editor-auto-save', DEFAULT_SETTINGS.autoSave)
        const showKeyPathsStorage = useStorage(
          'locales-editor-show-key-paths',
          DEFAULT_SETTINGS.showKeyPaths
        )
        const baseLanguageStorage = useStorage(
          'locales-editor-base-language',
          DEFAULT_SETTINGS.baseLanguage
        )
        const prettyPrintStorage = useStorage(
          'locales-editor-pretty-print',
          DEFAULT_SETTINGS.prettyPrint
        )

        // 同步到 store
        this.theme = themeStorage.value as 'light' | 'dark' | 'auto'
        this.interfaceLanguage = interfaceLanguageStorage.value
        this.autoSave = autoSaveStorage.value
        this.showKeyPaths = showKeyPathsStorage.value
        this.baseLanguage = baseLanguageStorage.value
        this.prettyPrint = prettyPrintStorage.value

        // 初始化主题
        this.initializeTheme()

        // 监听变化并同步到 localStorage
        this.$subscribe((_mutation, state) => {
          themeStorage.value = state.theme
          interfaceLanguageStorage.value = state.interfaceLanguage
          autoSaveStorage.value = state.autoSave
          showKeyPathsStorage.value = state.showKeyPaths
          baseLanguageStorage.value = state.baseLanguage
          prettyPrintStorage.value = state.prettyPrint
        })
      }
    },

    // 初始化主题
    initializeTheme() {
      if (import.meta.client) {
        const isDarkRef = useDark({
          selector: 'html',
          attribute: 'class',
          valueDark: 'dark',
          valueLight: '',
          storageKey: 'locales-editor-color-scheme',
          onChanged: (dark: boolean) => {
            this.isDark = dark
            // 主题切换时的回调
            document.documentElement.style.setProperty('color-scheme', dark ? 'dark' : 'light')
          }
        })

        this.isDark = isDarkRef.value

        // 根据设置应用主题
        this.applyTheme()
      }
    },

    // 应用主题设置
    applyTheme() {
      if (import.meta.client) {
        if (this.theme === 'auto') {
          // 自动模式：跟随系统
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          this.isDark = mediaQuery.matches
        } else {
          // 手动模式
          this.isDark = this.theme === 'dark'
        }

        // 更新 DOM
        const htmlElement = document.documentElement
        if (this.isDark) {
          htmlElement.classList.add('dark')
        } else {
          htmlElement.classList.remove('dark')
        }
        htmlElement.style.setProperty('color-scheme', this.isDark ? 'dark' : 'light')
      }
    },

    // 设置主题
    setTheme(theme: 'light' | 'dark' | 'auto') {
      this.theme = theme
      this.applyTheme()
    },

    // 切换主题
    toggleDark() {
      if (import.meta.client) {
        const isDarkRef = useDark()
        const toggleDarkRef = useToggle(isDarkRef)
        toggleDarkRef()
        this.isDark = isDarkRef.value

        // 更新主题设置为手动模式
        this.theme = this.isDark ? 'dark' : 'light'
      }
    },

    // 设置界面语言
    setInterfaceLanguage(language: string) {
      this.interfaceLanguage = language
    },

    // 设置自动保存
    setAutoSave(enabled: boolean) {
      this.autoSave = enabled
    },

    // 设置显示键路径
    setShowKeyPaths(enabled: boolean) {
      this.showKeyPaths = enabled
    },

    // 设置基准语言
    setBaseLanguage(language: string) {
      this.baseLanguage = language
    },

    // 设置美化打印
    setPrettyPrint(enabled: boolean) {
      this.prettyPrint = enabled
    },

    // 重置所有设置
    resetSettings() {
      this.theme = DEFAULT_SETTINGS.theme
      this.interfaceLanguage = DEFAULT_SETTINGS.interfaceLanguage
      this.autoSave = DEFAULT_SETTINGS.autoSave
      this.showKeyPaths = DEFAULT_SETTINGS.showKeyPaths
      this.baseLanguage = DEFAULT_SETTINGS.baseLanguage
      this.prettyPrint = DEFAULT_SETTINGS.prettyPrint
      this.applyTheme()
    },

    // 导出设置
    exportSettings(): string {
      return JSON.stringify(
        {
          theme: this.theme,
          interfaceLanguage: this.interfaceLanguage,
          autoSave: this.autoSave,
          showKeyPaths: this.showKeyPaths,
          baseLanguage: this.baseLanguage,
          prettyPrint: this.prettyPrint
        },
        null,
        2
      )
    },

    // 导入设置
    importSettings(settingsJson: string): boolean {
      try {
        const importedSettings = JSON.parse(settingsJson)

        // 验证并应用设置
        if (importedSettings.theme) this.theme = importedSettings.theme
        if (importedSettings.interfaceLanguage)
          this.interfaceLanguage = importedSettings.interfaceLanguage
        if (typeof importedSettings.autoSave === 'boolean')
          this.autoSave = importedSettings.autoSave
        if (typeof importedSettings.showKeyPaths === 'boolean')
          this.showKeyPaths = importedSettings.showKeyPaths
        if (importedSettings.baseLanguage) this.baseLanguage = importedSettings.baseLanguage
        if (typeof importedSettings.prettyPrint === 'boolean')
          this.prettyPrint = importedSettings.prettyPrint

        this.applyTheme()
        return true
      } catch (error) {
        console.error('Failed to import settings:', error)
        return false
      }
    }
  }
})
