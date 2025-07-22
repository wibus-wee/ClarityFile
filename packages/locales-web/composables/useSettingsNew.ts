import { computed, readonly } from 'vue'
import { useSettingsStore } from '~/stores/settings'

/**
 * 新的设置 composable，使用 Pinia store
 * 保持与原有 useSettings 相同的 API 接口，确保向后兼容
 */
export const useSettingsNew = () => {
  const store = useSettingsStore()

  // 在客户端初始化设置
  if (import.meta.client) {
    store.initializeSettings()
  }

  return {
    // 设置状态（可读写）
    theme: computed({
      get: () => store.theme,
      set: (value) => store.setTheme(value)
    }),
    interfaceLanguage: computed({
      get: () => store.interfaceLanguage,
      set: (value) => store.setInterfaceLanguage(value)
    }),
    autoSave: computed({
      get: () => store.autoSave,
      set: (value) => store.setAutoSave(value)
    }),
    showKeyPaths: computed({
      get: () => store.showKeyPaths,
      set: (value) => store.setShowKeyPaths(value)
    }),
    baseLanguage: computed({
      get: () => store.baseLanguage,
      set: (value) => store.setBaseLanguage(value)
    }),
    prettyPrint: computed({
      get: () => store.prettyPrint,
      set: (value) => store.setPrettyPrint(value)
    }),

    // 主题相关（只读）
    isDark: readonly(computed(() => store.isDark)),

    // 方法
    toggleDark: store.toggleDark,
    setTheme: store.setTheme,
    resetSettings: store.resetSettings,
    exportSettings: store.exportSettings,
    importSettings: store.importSettings
  }
}
