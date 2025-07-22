import { defineStore } from 'pinia'
import type { ApiResponse, FileSystemState, NamespaceInfo } from '~/types'

export const useFileSystemStore = defineStore('fileSystem', {
  state: (): FileSystemState => ({
    localesPath: '',
    namespaces: [],
    isLoading: false,
    error: null
  }),

  actions: {
    // 设置locales路径
    setLocalesPath(path: string) {
      this.localesPath = path
      this.loadNamespaces()
    },

    // 加载命名空间列表
    async loadNamespaces() {
      this.isLoading = true
      this.error = null

      try {
        const response =
          await $fetch<ApiResponse<{ namespaces: NamespaceInfo[] }>>('/api/namespaces')
        this.namespaces = response.data?.namespaces || []
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load namespaces'
        console.error('Failed to load namespaces:', err)
      } finally {
        this.isLoading = false
      }
    },

    // 读取特定命名空间的翻译文件
    async readNamespaceFile(namespace: string, language: string) {
      try {
        const response = await $fetch<
          ApiResponse<{ namespace: string; language: string; content: any }>
        >(`/api/locales/${namespace}/${language}`)
        return response.success ? response.data?.content : null
      } catch (err) {
        console.error(`Failed to read ${namespace}/${language}:`, err)
        return null
      }
    },

    // 写入翻译文件
    async writeNamespaceFile(namespace: string, language: string, data: any): Promise<boolean> {
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
    },

    // 创建新的翻译文件
    async createNamespaceFile(namespace: string, language: string): Promise<boolean> {
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
    },

    // 删除翻译文件
    async deleteNamespaceFile(namespace: string, language: string): Promise<boolean> {
      try {
        await $fetch(`/api/locales/${namespace}/${language}`, {
          method: 'DELETE' as any
        })
        return true
      } catch (err) {
        console.error(`Failed to delete ${namespace}/${language}:`, err)
        return false
      }
    },

    // 验证翻译完整性
    async validateTranslations() {
      try {
        const response = await $fetch('/api/validate')
        return response
      } catch (err) {
        console.error('Failed to validate translations:', err)
        return null
      }
    },

    // 清除错误状态
    clearError() {
      this.error = null
    }
  }
})
