import { computed, readonly } from 'vue'
import { useTranslationsStore } from '~/stores/translations'
import { useDialog } from '~/composables/useDialog'

/**
 * 新的翻译 composable，使用 Pinia store
 * 保持与原有 useTranslations 相同的 API 接口，确保向后兼容
 */
export const useTranslationsNew = () => {
  const store = useTranslationsStore()
  const dialog = useDialog()

  // 初始化自动保存（仅在客户端）
  if (import.meta.client) {
    store.initAutoSave()
  }

  return {
    // 只读状态
    activeNamespace: readonly(computed(() => store.activeNamespace)),
    namespaces: readonly(computed(() => store.namespaces)),
    currentLanguage: readonly(computed(() => store.currentLanguage)),
    availableLanguages: readonly(computed(() => store.availableLanguages)),
    languages: readonly(computed(() => store.languages)),
    baseLanguage: readonly(computed(() => store.baseLanguage)),
    getCurrentLanguage: readonly(computed(() => store.getCurrentLanguage)),
    translationEntries: readonly(computed(() => store.translationEntries)),
    filteredTranslationEntries: readonly(computed(() => store.filteredTranslationEntries)),
    isLoading: readonly(computed(() => store.isLoading)),
    hasUnsavedChanges: readonly(computed(() => store.hasUnsavedChanges)),
    modifiedEntries: readonly(computed(() => store.modifiedEntries)),
    translationProgress: readonly(computed(() => store.translationProgress)),
    showOnlyUntranslated: computed({
      get: () => store.showOnlyUntranslated,
      set: (value) => (store.showOnlyUntranslated = value)
    }),
    untranslatedCount: readonly(computed(() => store.untranslatedCount)),

    // Actions
    selectNamespace: store.selectNamespace,
    loadNamespaces: store.loadNamespaces,
    loadNamespaceTranslations: store.loadNamespaceTranslations,
    updateTranslation: store.updateTranslation,
    saveAllChanges: store.saveAllChanges,
    addTranslationKey: store.addTranslationKey,
    deleteTranslationKey: store.deleteTranslationKey,
    addLanguage: store.addLanguage,
    addAvailableLanguage: store.addAvailableLanguage,
    selectLanguage: store.selectLanguage,
    loadAvailableLanguages: store.loadAvailableLanguages,
    toggleUntranslatedFilter: store.toggleUntranslatedFilter,

    // 新增的批量操作功能
    batchUpdateTranslations: store.batchUpdateTranslations,
    batchDeleteTranslationKeys: store.batchDeleteTranslationKeys,
    exportTranslations: store.exportTranslations,
    cleanupUnusedKeys: store.cleanupUnusedKeys,
    resetStore: store.resetStore,

    // 自动保存控制
    scheduleAutoSave: store.scheduleAutoSave,
    cancelAutoSave: store.cancelAutoSave,

    // 保持 dialog 的兼容性
    dialog
  }
}
