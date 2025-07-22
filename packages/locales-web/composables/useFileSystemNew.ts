import { computed, readonly } from 'vue'
import { useFileSystemStore } from '~/stores/fileSystem'

/**
 * 新的文件系统 composable，使用 Pinia store
 * 保持与原有 useFileSystem 相同的 API 接口，确保向后兼容
 */
export const useFileSystemNew = () => {
  const store = useFileSystemStore()

  return {
    // 只读状态
    localesPath: readonly(computed(() => store.localesPath)),
    namespaces: readonly(computed(() => store.namespaces)),
    isLoading: readonly(computed(() => store.isLoading)),
    error: readonly(computed(() => store.error)),

    // Actions
    setLocalesPath: store.setLocalesPath,
    loadNamespaces: store.loadNamespaces,
    readNamespaceFile: store.readNamespaceFile,
    writeNamespaceFile: store.writeNamespaceFile,
    createNamespaceFile: store.createNamespaceFile,
    deleteNamespaceFile: store.deleteNamespaceFile,
    validateTranslations: store.validateTranslations,
    clearError: store.clearError
  }
}
