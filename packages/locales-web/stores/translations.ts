import { defineStore } from 'pinia'
import { useDialog } from '~/composables/useDialog'
import type { Language, Namespace, TranslationEntry, ApiResponse, TranslationsState } from '~/types'

const getDialog = () => {
  if (import.meta.client) {
    return useDialog()
  }
  return null
}

// 检查值是否未翻译的辅助函数
function isValueUntranslated(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value))
    return (
      value.length === 0 ||
      !value.some((item) => item && typeof item === 'string' && item.trim() !== '')
    )
  if (typeof value === 'object') return Object.keys(value).length === 0
  return true
}

export const useTranslationsStore = defineStore('translations', {
  state: (): TranslationsState => ({
    activeNamespace: '',
    namespaces: [],
    currentLanguage: 'zh-CN',
    availableLanguages: [
      { code: 'zh-CN', name: 'zh-CN', isBase: true },
      { code: 'en-US', name: 'en-US' }
    ],
    translationEntries: [],
    isLoading: false,
    hasUnsavedChanges: false,
    showOnlyUntranslated: false
  }),

  getters: {
    // 当前显示的语言列表（基准语言 + 当前选中语言）
    languages: (state): Language[] => {
      const baseLanguage = state.availableLanguages.find((lang) => lang.isBase)
      const currentLang = state.availableLanguages.find(
        (lang) => lang.code === state.currentLanguage
      )

      const result = []
      if (baseLanguage) result.push(baseLanguage)
      if (currentLang && currentLang.code !== baseLanguage?.code) result.push(currentLang)

      // 如果只有基准语言，添加第一个非基准语言以便比较
      if (result.length === 1 && state.availableLanguages.length > 1) {
        const firstNonBase = state.availableLanguages.find((lang) => !lang.isBase)
        if (firstNonBase) result.push(firstNonBase)
      }

      return result
    },

    // 基准语言
    baseLanguage: (state): Language => {
      return state.availableLanguages.find((lang) => lang.isBase) || state.availableLanguages[0]
    },

    // 当前语言对象
    getCurrentLanguage: (state): Language => {
      return (
        state.availableLanguages.find((lang) => lang.code === state.currentLanguage) ||
        state.availableLanguages.find((lang) => lang.isBase) ||
        state.availableLanguages[0]
      )
    },

    // 修改的条目
    modifiedEntries: (state): TranslationEntry[] => {
      return state.translationEntries.filter((entry) => entry.isModified)
    },

    // 筛选后的翻译条目
    filteredTranslationEntries(): TranslationEntry[] {
      if (!this.showOnlyUntranslated) {
        return this.translationEntries
      }

      // 筛选出有未翻译字段的条目
      return this.translationEntries.filter((entry) => {
        // 如果条目正在被修改，保持可见（避免输入时条目消失）
        if (entry.isModified) {
          return true
        }

        // 检查是否有任何非基准语言的值为空
        return this.languages.some((lang) => {
          if (lang.isBase) return false // 跳过基准语言
          const value = entry.values[lang.code]
          return isValueUntranslated(value)
        })
      })
    },

    // 未翻译条目统计
    untranslatedCount(): number {
      return this.translationEntries.filter((entry) => {
        return this.languages.some((lang) => {
          if (lang.isBase) return false
          const value = entry.values[lang.code]
          return isValueUntranslated(value)
        })
      }).length
    },

    // 翻译进度
    translationProgress(): number {
      // 排除基准语言，只计算需要翻译的语言
      const nonBaseLanguages = this.languages.filter((lang) => lang.code !== 'zh-CN')

      if (nonBaseLanguages.length === 0 || this.translationEntries.length === 0) {
        return 100 // 如果没有需要翻译的语言，则认为100%完成
      }

      const total = this.translationEntries.length * nonBaseLanguages.length
      const completed = this.translationEntries.reduce((count, entry) => {
        return (
          count +
          nonBaseLanguages.filter((lang) => {
            const value = entry.values[lang.code]
            if (!value) return false

            // 处理字符串类型
            if (typeof value === 'string') {
              return value.trim() !== ''
            }

            // 处理数组类型
            if (Array.isArray(value)) {
              return (
                value.length > 0 && value.some((item) => item && item.trim && item.trim() !== '')
              )
            }

            // 处理对象类型
            if (typeof value === 'object') {
              return Object.keys(value).length > 0
            }

            return false
          }).length
        )
      }, 0)

      return total > 0 ? Math.round((completed / total) * 100) : 0
    }
  },

  actions: {
    // 私有属性：自动保存定时器
    _autoSaveTimer: null as NodeJS.Timeout | null,

    // 初始化自动保存
    initAutoSave() {
      // 监听状态变化，当有未保存更改时启动自动保存
      this.$subscribe((mutation, state) => {
        if (state.hasUnsavedChanges && this._autoSaveTimer === null) {
          this.scheduleAutoSave()
        }
      })
    },

    // 安排自动保存
    scheduleAutoSave() {
      // 清除现有定时器
      if (this._autoSaveTimer) {
        clearTimeout(this._autoSaveTimer)
      }

      // 设置新的定时器（5秒后自动保存）
      this._autoSaveTimer = setTimeout(async () => {
        if (this.hasUnsavedChanges) {
          console.log('Auto-saving translations...')
          const result = await this.saveAllChanges()
          if (result) {
            console.log('Auto-save completed successfully')
          } else {
            console.warn('Auto-save failed')
          }
        }
        this._autoSaveTimer = null
      }, 5000)
    },

    // 取消自动保存
    cancelAutoSave() {
      if (this._autoSaveTimer) {
        clearTimeout(this._autoSaveTimer)
        this._autoSaveTimer = null
      }
    },

    // 选择命名空间
    async selectNamespace(namespace: string): Promise<boolean> {
      if (!namespace || this.activeNamespace === namespace) {
        return true
      }

      const dialog = getDialog()

      if (this.hasUnsavedChanges) {
        if (dialog) {
          const shouldSave = await dialog.confirm(
            'You have unsaved changes. Save them before switching namespaces? Choosing "Skip" will discard those edits.',
            {
              title: 'Unsaved changes',
              confirmText: 'Save & Switch',
              cancelText: 'Skip Save'
            }
          )

          if (shouldSave) {
            const saved = await this.saveAllChanges()
            if (!saved) {
              await dialog.alert(
                'We could not save your changes. Resolve the issue and try again before switching namespaces.',
                { title: 'Save failed' }
              )
              return false
            }
          }
        } else {
          const saved = await this.saveAllChanges()
          if (!saved) {
            return false
          }
        }
      }

      this.activeNamespace = namespace

      if (import.meta.client) {
        const router = useRouter()
        await router.push({
          query: { namespace }
        })
      }

      await this.loadNamespaceTranslations(namespace)
      return true
    },

    // 语言选择管理 - 改为单选
    async selectLanguage(languageCode: string): Promise<boolean> {
      if (!languageCode || languageCode === this.currentLanguage) {
        return true
      }

      const targetLanguage = this.availableLanguages.find((lang) => lang.code === languageCode)

      const dialog = getDialog()

      if (!targetLanguage) {
        console.warn(`Language ${languageCode} is not registered in availableLanguages`)
        await dialog?.alert('The selected language is not available. Please refresh and try again.', {
          title: 'Language unavailable'
        })

        return false
      }

      if (this.hasUnsavedChanges) {

        if (dialog) {
          const shouldProceed = await dialog.confirm(
            'Switching languages will save your pending edits first. Continue?',
            {
              title: 'Unsaved changes',
              confirmText: 'Save & Switch',
              cancelText: 'Stay'
            }
          )

          if (!shouldProceed) {
            return false
          }

          const saved = await this.saveAllChanges()
          if (!saved) {
            await dialog.alert(
              'We could not save your changes, so the language was not switched. Please try again.',
              { title: 'Save failed' }
            )
            return false
          }
        } else {
          const saved = await this.saveAllChanges()
          if (!saved) {
            return false
          }

        }
      }

      this.currentLanguage = languageCode

      if (this.activeNamespace) {
        await this.loadNamespaceTranslations(this.activeNamespace)
      }

      return true
    },

    // 切换筛选状态
    toggleUntranslatedFilter() {
      this.showOnlyUntranslated = !this.showOnlyUntranslated
    },

    // 更新翻译值
    updateTranslation(pathOrIndex: string | number, languageCode: string, value: string) {
      let entry: TranslationEntry | undefined

      if (typeof pathOrIndex === 'string') {
        // 根据路径查找条目
        entry = this.translationEntries.find((e) => e.path === pathOrIndex)
      } else {
        // 根据索引查找条目（保持向后兼容）
        entry = this.translationEntries[pathOrIndex]
      }

      if (entry) {
        entry.values[languageCode] = value
        entry.isModified = true
        this.hasUnsavedChanges = true
      }
    },

    // 删除翻译键
    deleteTranslationKey(pathOrIndex: string | number) {
      let targetIndex: number = -1

      if (typeof pathOrIndex === 'string') {
        // 根据路径查找索引
        targetIndex = this.translationEntries.findIndex((e) => e.path === pathOrIndex)
      } else {
        // 直接使用索引（保持向后兼容）
        targetIndex = pathOrIndex
      }

      if (targetIndex !== -1) {
        this.translationEntries.splice(targetIndex, 1)
        this.hasUnsavedChanges = true
      }
    },

    // 添加新的翻译键
    async addTranslationKey(
      keyPath: string,
      initialValues: Record<string, any> = {}
    ): Promise<boolean> {
      if (!this.activeNamespace) return false

      // 检查键是否已存在
      const exists = this.translationEntries.some((entry) => entry.path === keyPath)
      if (exists) {
        console.warn(`Translation key "${keyPath}" already exists in ${this.activeNamespace}`)
        return false
      }

      const languageSources = this.availableLanguages.length
        ? this.availableLanguages
        : this.languages

      const values = languageSources.reduce(
        (acc, lang) => {
          acc[lang.code] = initialValues[lang.code] ?? ''
          return acc
        },
        {} as Record<string, any>
      )

      const sampleValue = values[this.baseLanguage.code]
      let detectedType: 'string' | 'array' | 'object' | 'number' | 'boolean' = 'string'

      if (Array.isArray(sampleValue)) {
        detectedType = 'array'
      } else if (typeof sampleValue === 'object' && sampleValue !== null) {
        detectedType = 'object'
      } else if (typeof sampleValue === 'number') {
        detectedType = 'number'
      } else if (typeof sampleValue === 'boolean') {
        detectedType = 'boolean'
      }

      // 添加新条目
      const newEntry: TranslationEntry = {
        key: keyPath.split('.').pop() || keyPath,
        path: keyPath,
        values,
        type: detectedType,
        isModified: true
      }

      this.translationEntries.push(newEntry)
      this.translationEntries.sort((a, b) => a.path.localeCompare(b.path))
      this.hasUnsavedChanges = true

      return true
    },

    // 添加新语言到可用列表
    async addAvailableLanguage(code: string, name: string): Promise<boolean> {
      // 检查语言是否已存在
      const exists = this.availableLanguages.some((lang) => lang.code === code)
      if (exists) {
        console.warn(`Language ${code} already exists in the available list`)
        return false
      }

      // 添加语言到可用列表
      this.availableLanguages.push({ code, name })

      // 自动选择新添加的语言
      this.currentLanguage = code

      // 为所有现有条目添加新语言的空值
      this.translationEntries.forEach((entry) => {
        entry.values[code] = ''
        entry.isModified = true
      })

      this.hasUnsavedChanges = true
      return true
    },

    // 添加新语言（创建实际文件）
    async addLanguage(code: string, name: string): Promise<boolean> {
      try {
        // 检查语言是否已存在
        const exists = this.availableLanguages.some((lang) => lang.code === code)
        if (exists) {
          console.warn(`Language ${code} already exists in the available list`)
          return false
        }

        // 调用 API 创建语言文件
        const response = await $fetch('/api/languages', {
          method: 'POST',
          body: { languageCode: code }
        })

        if (response.success) {
          // 添加到可用语言列表
          this.availableLanguages.push({ code, name })

          // 自动选择新添加的语言
          this.currentLanguage = code

          // 重新加载当前命名空间的数据
          if (this.activeNamespace) {
            await this.loadNamespaceTranslations(this.activeNamespace)
          }

          return true
        } else {
          return false
        }
      } catch (error) {
        console.error('Error adding language:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        const dialog = getDialog()
        await dialog?.alert(`Failed to add language: ${errorMessage}`, { title: 'Operation failed' })
        return false
      }
    },

    // 加载可用语言列表
    async loadAvailableLanguages() {
      try {
        const response =
          await $fetch<ApiResponse<{ languages: Language[]; count: number }>>('/api/languages')
        if (response.success && response.data) {
          const previousLanguages = new Map(
            this.availableLanguages.map((lang) => [lang.code, lang])
          )

          this.availableLanguages = response.data.languages.map((lang) => {
            const existing = previousLanguages.get(lang.code)
            if (existing) {
              return {
                ...lang,
                name: existing.name || lang.name
              }
            }
            return lang
          })

          // 如果当前语言不在可用语言中，切换到基准语言
          const currentExists = this.availableLanguages.some(
            (lang) => lang.code === this.currentLanguage
          )
          if (!currentExists) {
            const baseLanguage = this.availableLanguages.find((lang) => lang.isBase)
            if (baseLanguage) {
              this.currentLanguage = baseLanguage.code
            }
          }
        }
      } catch (error) {
        console.error('Error loading available languages:', error)
      }
    },

    // 加载命名空间列表
    async loadNamespaces() {
      try {
        // 直接调用 API 获取真实的命名空间数据
        const response = await $fetch<ApiResponse<{ namespaces: any[] }>>('/api/namespaces')
        if (
          response &&
          response.success &&
          response.data?.namespaces &&
          response.data.namespaces.length > 0
        ) {
          this.namespaces = response.data.namespaces.map((ns: any) => ({
            name: ns.name,
            displayName: ns.label || ns.name,
            keyCount: ns.count || 0,
            progress: ns.progress || 0 // 使用真实的进度数据
          }))
        } else {
          // 如果 API 返回空数据，提供默认的命名空间列表作为fallback
          this.namespaces = []
        }
      } catch (error) {
        console.error('Error loading namespaces:', error)
        // API 调用失败时，提供默认的命名空间列表作为fallback
        this.namespaces = []
      }
    },

    // 加载命名空间的翻译数据
    async loadNamespaceTranslations(namespace: string) {
      this.isLoading = true
      // 不立即清空数据，等新数据加载完成后再替换，避免闪烁

      try {
        // 直接调用 API，避免循环依赖
        const translationData: Record<string, any> = {}

        for (const language of this.languages) {
          try {
            const response = await $fetch<
              ApiResponse<{ namespace: string; language: string; content: any }>
            >(`/api/locales/${namespace}/${language.code}`)
            if (response.success && response.data?.content) {
              translationData[language.code] = response.data.content
            }
          } catch (err) {
            console.error(`Failed to read ${namespace}/${language.code}:`, err)
          }
        }

        // 收集所有的翻译键
        const allKeys = new Set<string>()
        Object.values(translationData).forEach((data) => {
          this.collectKeys(data, '', allKeys)
        })

        // 创建翻译条目
        this.translationEntries = Array.from(allKeys).map((key) => {
          const values = this.languages.reduce(
            (acc, lang) => {
              acc[lang.code] = this.getValueByPath(translationData[lang.code] || {}, key) || ''
              return acc
            },
            {} as Record<string, any>
          )

          // 确定数据类型（基于基准语言的值）
          const baseValue = values[this.baseLanguage.code]
          let type: 'string' | 'array' | 'object' | 'number' | 'boolean' = 'string'

          if (Array.isArray(baseValue)) {
            type = 'array'
          } else if (typeof baseValue === 'object' && baseValue !== null) {
            type = 'object'
          } else if (typeof baseValue === 'number') {
            type = 'number'
          } else if (typeof baseValue === 'boolean') {
            type = 'boolean'
          }

          return {
            key: key.split('.').pop() || key,
            path: key,
            values,
            type,
            isModified: false
          }
        })
      } catch (err) {
        console.error('Failed to load namespace translations:', err)
      } finally {
        this.isLoading = false
      }
    },

    // 递归收集所有键路径
    collectKeys(obj: any, prefix: string, keys: Set<string>) {
      Object.keys(obj).forEach((key) => {
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (Array.isArray(obj[key])) {
          // 数组作为一个整体键，不递归进入
          keys.add(fullKey)
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.collectKeys(obj[key], fullKey, keys)
        } else {
          keys.add(fullKey)
        }
      })
    },

    // 根据路径获取值
    getValueByPath(obj: any, path: string): any {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : ''
      }, obj)
    },

    // 根据路径设置值
    setValueByPath(obj: any, path: string, value: any) {
      const keys = path.split('.')
      const lastKey = keys.pop()!

      const target = keys.reduce((current, key) => {
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {}
        }
        return current[key]
      }, obj)

      target[lastKey] = value
    },

    // 保存所有修改
    async saveAllChanges(): Promise<boolean> {
      if (!this.activeNamespace || this.modifiedEntries.length === 0) {
        return true
      }

      try {
        // 为每种语言重建数据结构
        const languageData: Record<string, any> = {}

        this.languages.forEach((lang) => {
          languageData[lang.code] = {}
        })

        // 将所有条目的值设置到对应的数据结构中
        this.translationEntries.forEach((entry) => {
          this.languages.forEach((lang) => {
            const value = entry.values[lang.code]
            // 只要值不是 null 或 undefined，就保存（包括空字符串）
            if (value !== null && value !== undefined) {
              this.setValueByPath(languageData[lang.code], entry.path, value)
            }
          })
        })

        // 保存每个语言文件，直接调用 API 避免循环依赖
        for (const language of this.languages) {
          try {
            const response = await $fetch<
              ApiResponse<{ namespace: string; language: string; filePath: string }>
            >(`/api/locales/${this.activeNamespace}/${language.code}`, {
              method: 'PUT',
              body: { data: languageData[language.code] }
            })

            if (!response.success) {
              throw new Error(`Failed to save ${language.code}`)
            }
          } catch (err) {
            console.error(`Failed to write ${this.activeNamespace}/${language.code}:`, err)
            throw new Error(`Failed to save ${language.code}`)
          }
        }

        // 重置修改状态
        this.translationEntries.forEach((entry) => {
          entry.isModified = false
        })
        this.hasUnsavedChanges = false

        return true
      } catch (err) {
        console.error('Failed to save changes:', err)
        return false
      }
    },

    // 批量更新翻译
    async batchUpdateTranslations(
      updates: Array<{
        path: string
        languageCode: string
        value: string
      }>
    ): Promise<{ success: number; failed: number }> {
      let success = 0
      let failed = 0

      for (const update of updates) {
        try {
          this.updateTranslation(update.path, update.languageCode, update.value)
          success++
        } catch (error) {
          console.error(`Failed to update ${update.path}:`, error)
          failed++
        }
      }

      return { success, failed }
    },

    // 批量删除翻译键
    async batchDeleteTranslationKeys(
      paths: string[]
    ): Promise<{ success: number; failed: number }> {
      let success = 0
      let failed = 0

      for (const path of paths) {
        try {
          this.deleteTranslationKey(path)
          success++
        } catch (error) {
          console.error(`Failed to delete ${path}:`, error)
          failed++
        }
      }

      return { success, failed }
    },

    // 导出翻译数据
    exportTranslations(format: 'json' | 'csv' = 'json'): string {
      if (format === 'json') {
        return JSON.stringify(
          {
            namespace: this.activeNamespace,
            languages: this.languages.map((lang) => lang.code),
            entries: this.translationEntries.map((entry) => ({
              key: entry.key,
              path: entry.path,
              type: entry.type,
              values: entry.values
            }))
          },
          null,
          2
        )
      }

      // CSV 格式
      const headers = ['Key', 'Path', 'Type', ...this.languages.map((lang) => lang.code)]
      const rows = this.translationEntries.map((entry) => [
        entry.key,
        entry.path,
        entry.type,
        ...this.languages.map((lang) => entry.values[lang.code] || '')
      ])

      return [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')
    },

    // 清理未使用的翻译键
    async cleanupUnusedKeys(): Promise<{ removed: number; keys: string[] }> {
      // 这里应该实现检查哪些键在代码中未被使用的逻辑
      // 目前返回空结果作为占位符
      console.log('Cleanup unused keys - feature not implemented yet')
      return { removed: 0, keys: [] }
    },

    // 重置 store 状态
    resetStore() {
      this.activeNamespace = ''
      this.namespaces = []
      this.translationEntries = []
      this.hasUnsavedChanges = false
      this.showOnlyUntranslated = false
      this.cancelAutoSave()
    }
  }
})
