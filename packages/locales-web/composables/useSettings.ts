import { useDark, useToggle, useStorage } from '@vueuse/core'

// 设置默认值
const DEFAULT_SETTINGS = {
  theme: 'auto',
  interfaceLanguage: 'zh-CN',
  autoSave: true,
  showKeyPaths: true,
  baseLanguage: 'zh-CN',
  prettyPrint: true
}

// 全局设置状态
const settings = reactive({
  theme: useStorage('locales-editor-theme', DEFAULT_SETTINGS.theme),
  interfaceLanguage: useStorage(
    'locales-editor-interface-language',
    DEFAULT_SETTINGS.interfaceLanguage
  ),
  autoSave: useStorage('locales-editor-auto-save', DEFAULT_SETTINGS.autoSave),
  showKeyPaths: useStorage('locales-editor-show-key-paths', DEFAULT_SETTINGS.showKeyPaths),
  baseLanguage: useStorage('locales-editor-base-language', DEFAULT_SETTINGS.baseLanguage),
  prettyPrint: useStorage('locales-editor-pretty-print', DEFAULT_SETTINGS.prettyPrint)
})

// 主题管理 - 简化版本，直接使用 useDark
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'locales-editor-color-scheme',
  onChanged(dark: boolean) {
    // 主题切换时的回调
    if (process.client) {
      document.documentElement.style.setProperty('color-scheme', dark ? 'dark' : 'light')
    }
  }
})

// 简化的主题切换函数
const toggleDark = useToggle(isDark)

export function useSettings() {
  // 设置主题
  function setTheme(theme: 'light' | 'dark' | 'auto') {
    if (theme === 'auto') {
      // 自动模式：跟随系统
      if (process.client) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        isDark.value = mediaQuery.matches
      }
    } else {
      // 手动模式
      isDark.value = theme === 'dark'
    }
    settings.theme = theme
  }

  // 重置所有设置
  function resetSettings() {
    Object.assign(settings, DEFAULT_SETTINGS)
  }

  // 导出设置
  function exportSettings() {
    return JSON.stringify(settings, null, 2)
  }

  // 导入设置
  function importSettings(settingsJson: string) {
    try {
      const importedSettings = JSON.parse(settingsJson)
      Object.assign(settings, { ...DEFAULT_SETTINGS, ...importedSettings })
      return true
    } catch (error) {
      console.error('Failed to import settings:', error)
      return false
    }
  }

  return {
    // 设置状态
    theme: toRef(settings, 'theme'),
    interfaceLanguage: toRef(settings, 'interfaceLanguage'),
    autoSave: toRef(settings, 'autoSave'),
    showKeyPaths: toRef(settings, 'showKeyPaths'),
    baseLanguage: toRef(settings, 'baseLanguage'),
    prettyPrint: toRef(settings, 'prettyPrint'),

    // 主题相关
    isDark: readonly(isDark),
    toggleDark,

    // 方法
    setTheme,
    resetSettings,
    exportSettings,
    importSettings
  }
}
