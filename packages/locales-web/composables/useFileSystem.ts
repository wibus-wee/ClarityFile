import { ref, computed } from 'vue'
import type { ApiResponse } from '~/types'

interface NamespaceInfo {
  name: string
  label: string
  count: number
  languages: string[]
}

export const useFileSystem = () => {
  const localesPath = ref<string>('')
  const namespaces = ref<NamespaceInfo[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 设置locales路径
  const setLocalesPath = (path: string) => {
    localesPath.value = path
    loadNamespaces()
  }

  // 加载命名空间列表
  const loadNamespaces = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<{ namespaces: NamespaceInfo[] }>>('/api/namespaces')
      namespaces.value = response.data?.namespaces || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load namespaces'
      console.error('Failed to load namespaces:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 读取特定命名空间的翻译文件
  const readNamespaceFile = async (namespace: string, language: string) => {
    try {
      const response = await $fetch<
        ApiResponse<{ namespace: string; language: string; content: any }>
      >(`/api/locales/${namespace}/${language}`)
      return response.success ? response.data?.content : null
    } catch (err) {
      console.error(`Failed to read ${namespace}/${language}:`, err)
      return null
    }
  }

  // 写入翻译文件
  const writeNamespaceFile = async (namespace: string, language: string, data: any) => {
    try {
      const response = await $fetch<
        ApiResponse<{ namespace: string; language: string; filePath: string }>
      >(`/api/locales/${namespace}/${language}`, {
        method: 'PUT',
        body: { data }
      })
      return response.success
    } catch (err) {
      console.error(`Failed to write ${namespace}/${language}:`, err)
      return false
    }
  }

  // 创建新的翻译文件
  const createNamespaceFile = async (namespace: string, language: string) => {
    try {
      await $fetch(`/api/locales/${namespace}/${language}`, {
        method: 'POST' as any,
        body: { data: {} }
      })
      return true
    } catch (err) {
      console.error(`Failed to create ${namespace}/${language}:`, err)
      return false
    }
  }

  // 删除翻译文件
  const deleteNamespaceFile = async (namespace: string, language: string) => {
    try {
      await $fetch(`/api/locales/${namespace}/${language}`, {
        method: 'DELETE' as any
      })
      return true
    } catch (err) {
      console.error(`Failed to delete ${namespace}/${language}:`, err)
      return false
    }
  }

  // 验证翻译完整性
  const validateTranslations = async () => {
    try {
      const response = await $fetch('/api/validate')
      return response
    } catch (err) {
      console.error('Failed to validate translations:', err)
      return null
    }
  }

  return {
    localesPath: readonly(localesPath),
    namespaces: readonly(namespaces),
    isLoading: readonly(isLoading),
    error: readonly(error),
    setLocalesPath,
    loadNamespaces,
    readNamespaceFile,
    writeNamespaceFile,
    createNamespaceFile,
    deleteNamespaceFile,
    validateTranslations
  }
}
