import { ref, computed } from 'vue'
import type {
  Language,
  Namespace,
  TranslationEntry,
  ApiResponse
} from '~/types'

// 全局状态 - 在模块级别定义，确保单例
const activeNamespace = ref<string>('')
const namespaces = ref<Namespace[]>([])
// 改为单选模式 - 当前编辑的语言
const currentLanguage = ref<string>('zh-CN')
const availableLanguages = ref<Language[]>([
  { code: 'zh-CN', name: 'zh-CN', isBase: true },
  { code: 'en-US', name: 'en-US' }
])

// 当前显示的语言列表（基准语言 + 当前选中语言）
const languages = computed(() => {
  const baseLanguage = availableLanguages.value.find((lang) => lang.isBase)
  const currentLang = availableLanguages.value.find((lang) => lang.code === currentLanguage.value)

  const result = []
  if (baseLanguage) result.push(baseLanguage)
  if (currentLang && currentLang.code !== baseLanguage?.code) result.push(currentLang)

  // 如果只有基准语言，添加第一个非基准语言以便比较
  if (result.length === 1 && availableLanguages.value.length > 1) {
    const firstNonBase = availableLanguages.value.find((lang) => !lang.isBase)
    if (firstNonBase) result.push(firstNonBase)
  }

  return result
})

// 基准语言
const baseLanguage = computed(
  () => availableLanguages.value.find((lang) => lang.isBase) || availableLanguages.value[0]
)

const translationEntries = ref<TranslationEntry[]>([])
const isLoading = ref(false)
const hasUnsavedChanges = ref(false)

// 筛选状态
const showOnlyUntranslated = ref(false)

export const useTranslations = () => {
  const fileSystem = useFileSystem()
  const dialog = useDialog()

  // 检查值是否未翻译的辅助函数
  const isValueUntranslated = (value: any): boolean => {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value))
      return (
        value.length === 0 ||
        value.every((item) => (typeof item === 'string' ? item.trim() === '' : !item))
      )
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  }

  // 计算属性
  const modifiedEntries = computed(() =>
    translationEntries.value.filter((entry) => entry.isModified)
  )

  // 筛选后的翻译条目
  const filteredTranslationEntries = computed(() => {
    if (!showOnlyUntranslated.value) {
      return translationEntries.value
    }

    // 筛选出有未翻译字段的条目
    return translationEntries.value.filter((entry) => {
      // 检查是否有任何非基准语言的值为空
      return languages.value.some((lang) => {
        if (lang.isBase) return false // 跳过基准语言
        const value = entry.values[lang.code]
        return isValueUntranslated(value)
      })
    })
  })

  // 未翻译条目统计
  const untranslatedCount = computed(() => {
    return translationEntries.value.filter((entry) => {
      return languages.value.some((lang) => {
        if (lang.isBase) return false
        const value = entry.values[lang.code]
        return isValueUntranslated(value)
      })
    }).length
  })

  const translationProgress = computed(() => {
    const total = translationEntries.value.length * languages.value.length
    const completed = translationEntries.value.reduce((count, entry) => {
      return (
        count +
        languages.value.filter((lang) => {
          const value = entry.values[lang.code]
          if (!value) return false

          // 处理字符串类型
          if (typeof value === 'string') {
            return value.trim() !== ''
          }

          // 处理数组类型
          if (Array.isArray(value)) {
            return value.length > 0 && value.some((item) => item && item.trim && item.trim() !== '')
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
  })

  // 选择命名空间
  const selectNamespace = async (namespace: string) => {
    // 如果选择的是当前命名空间，直接返回
    if (activeNamespace.value === namespace) {
      return
    }

    if (hasUnsavedChanges.value) {
      const shouldSave = confirm('有未保存的修改，是否保存？')
      if (shouldSave) {
        await saveAllChanges()
      }
    }

    activeNamespace.value = namespace
    await loadNamespaceTranslations(namespace)
  }

  // 加载命名空间的翻译数据
  const loadNamespaceTranslations = async (namespace: string) => {
    isLoading.value = true
    // 不立即清空数据，等新数据加载完成后再替换，避免闪烁

    try {
      // 加载所有语言的翻译文件
      const translationData: Record<string, any> = {}

      for (const language of languages.value) {
        const data = await fileSystem.readNamespaceFile(namespace, language.code)
        if (data) {
          translationData[language.code] = data
        }
      }

      // 收集所有的翻译键
      const allKeys = new Set<string>()
      Object.values(translationData).forEach((data) => {
        collectKeys(data, '', allKeys)
      })

      // 创建翻译条目
      translationEntries.value = Array.from(allKeys).map((key) => {
        const values = languages.value.reduce(
          (acc, lang) => {
            acc[lang.code] = getValueByPath(translationData[lang.code] || {}, key) || ''
            return acc
          },
          {} as Record<string, any>
        )

        // 确定数据类型（基于基准语言的值）
        const baseValue = values[baseLanguage.value.code]
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
      isLoading.value = false
    }
  }

  // 递归收集所有键路径
  const collectKeys = (obj: any, prefix: string, keys: Set<string>) => {
    Object.keys(obj).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (Array.isArray(obj[key])) {
        // 数组作为一个整体键，不递归进入
        keys.add(fullKey)
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        collectKeys(obj[key], fullKey, keys)
      } else {
        keys.add(fullKey)
      }
    })
  }

  // 根据路径获取值
  const getValueByPath = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : ''
    }, obj)
  }

  // 根据路径设置值
  const setValueByPath = (obj: any, path: string, value: any) => {
    const keys = path.split('.')
    const lastKey = keys.pop()!

    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      return current[key]
    }, obj)

    target[lastKey] = value
  }

  // 更新翻译值
  const updateTranslation = (entryIndex: number, languageCode: string, value: string) => {
    const entry = translationEntries.value[entryIndex]
    if (entry) {
      entry.values[languageCode] = value
      entry.isModified = true
      hasUnsavedChanges.value = true
    }
  }

  // 保存所有修改
  const saveAllChanges = async () => {
    if (!activeNamespace.value || modifiedEntries.value.length === 0) {
      return true
    }

    try {
      // 为每种语言重建数据结构
      const languageData: Record<string, any> = {}

      languages.value.forEach((lang) => {
        languageData[lang.code] = {}
      })

      // 将所有条目的值设置到对应的数据结构中
      translationEntries.value.forEach((entry) => {
        languages.value.forEach((lang) => {
          if (entry.values[lang.code]) {
            setValueByPath(languageData[lang.code], entry.path, entry.values[lang.code])
          }
        })
      })

      // 保存每个语言文件
      for (const language of languages.value) {
        const success = await fileSystem.writeNamespaceFile(
          activeNamespace.value,
          language.code,
          languageData[language.code]
        )

        if (!success) {
          throw new Error(`Failed to save ${language.code}`)
        }
      }

      // 重置修改状态
      translationEntries.value.forEach((entry) => {
        entry.isModified = false
      })
      hasUnsavedChanges.value = false

      return true
    } catch (err) {
      console.error('Failed to save changes:', err)
      return false
    }
  }

  // 添加新的翻译键
  const addTranslationKey = async (keyPath: string) => {
    if (!activeNamespace.value) return false

    // 检查键是否已存在
    const exists = translationEntries.value.some((entry) => entry.path === keyPath)
    if (exists) {
      await dialog.alert('该键已存在')
      return false
    }

    // 添加新条目
    const newEntry: TranslationEntry = {
      key: keyPath.split('.').pop() || keyPath,
      path: keyPath,
      values: languages.value.reduce(
        (acc, lang) => {
          acc[lang.code] = ''
          return acc
        },
        {} as Record<string, any>
      ),
      type: 'string',
      isModified: true
    }

    translationEntries.value.push(newEntry)
    hasUnsavedChanges.value = true

    return true
  }

  // 删除翻译键
  const deleteTranslationKey = (entryIndex: number) => {
    translationEntries.value.splice(entryIndex, 1)
    hasUnsavedChanges.value = true
  }

  // 语言选择管理 - 改为单选
  const selectLanguage = (languageCode: string) => {
    currentLanguage.value = languageCode
  }

  const getCurrentLanguage = computed(() => {
    return (
      availableLanguages.value.find((lang) => lang.code === currentLanguage.value) ||
      availableLanguages.value.find((lang) => lang.isBase) ||
      availableLanguages.value[0]
    )
  })

  // 添加新语言到可用列表
  const addAvailableLanguage = async (code: string, name: string) => {
    // 检查语言是否已存在
    const exists = availableLanguages.value.some((lang) => lang.code === code)
    if (exists) {
      await dialog.alert('该语言已存在')
      return false
    }

    // 添加语言到可用列表
    availableLanguages.value.push({ code, name })

    // 自动选择新添加的语言
    currentLanguage.value = code

    // 为所有现有条目添加新语言的空值
    translationEntries.value.forEach((entry) => {
      entry.values[code] = ''
      entry.isModified = true
    })

    hasUnsavedChanges.value = true
    return true
  }

  // 添加新语言（创建实际文件）
  const addLanguage = async (code: string, name: string) => {
    try {
      // 检查语言是否已存在
      const exists = availableLanguages.value.some((lang) => lang.code === code)
      if (exists) {
        await dialog.alert('该语言已存在')
        return false
      }

      // 调用 API 创建语言文件
      const response = await $fetch('/api/languages', {
        method: 'POST',
        body: { languageCode: code }
      })

      if (response.success) {
        // 添加到可用语言列表
        availableLanguages.value.push({ code, name })

        // 自动选择新添加的语言
        currentLanguage.value = code

        // 重新加载当前命名空间的数据
        if (activeNamespace.value) {
          await loadNamespaceTranslations(activeNamespace.value)
        }

        return true
      } else {
        await dialog.alert('添加语言失败')
        return false
      }
    } catch (error) {
      console.error('Error adding language:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      await dialog.alert(`添加语言失败: ${errorMessage}`)
      return false
    }
  }

  // 切换筛选状态
  const toggleUntranslatedFilter = () => {
    showOnlyUntranslated.value = !showOnlyUntranslated.value
  }

  // 加载可用语言列表
  const loadAvailableLanguages = async () => {
    try {
      const response = await $fetch<ApiResponse<{ languages: Language[], count: number }>>('/api/languages')
      if (response.success && response.data) {
        availableLanguages.value = response.data.languages

        // 如果当前语言不在可用语言中，切换到基准语言
        const currentExists = availableLanguages.value.some(
          (lang) => lang.code === currentLanguage.value
        )
        if (!currentExists) {
          const baseLanguage = availableLanguages.value.find((lang) => lang.isBase)
          if (baseLanguage) {
            currentLanguage.value = baseLanguage.code
          }
        }
      }
    } catch (error) {
      console.error('Error loading available languages:', error)
    }
  }

  // 加载命名空间列表
  async function loadNamespaces() {
    try {
      // 直接调用 API 获取真实的命名空间数据
      const response = await $fetch<ApiResponse<{ namespaces: any[] }>>('/api/namespaces')
      if (response && response.success && response.data?.namespaces && response.data.namespaces.length > 0) {
        namespaces.value = response.data.namespaces.map((ns: any) => ({
          name: ns.name,
          displayName: ns.label || ns.name,
          keyCount: ns.count || 0,
          progress: ns.progress || 0 // 使用真实的进度数据
        }))
      } else {
        // 如果 API 返回空数据，提供默认的命名空间列表作为fallback
        namespaces.value = []
      }
    } catch (error) {
      console.error('Error loading namespaces:', error)
      // API 调用失败时，提供默认的命名空间列表作为fallback
      namespaces.value = []
    }
  }

  return {
    activeNamespace: readonly(activeNamespace),
    namespaces: readonly(namespaces),
    currentLanguage: readonly(currentLanguage),
    availableLanguages: readonly(availableLanguages),
    languages: readonly(languages),
    baseLanguage: readonly(baseLanguage),
    getCurrentLanguage: readonly(getCurrentLanguage),
    translationEntries: readonly(translationEntries),
    filteredTranslationEntries: readonly(filteredTranslationEntries),
    isLoading: readonly(isLoading),
    hasUnsavedChanges: readonly(hasUnsavedChanges),
    modifiedEntries: readonly(modifiedEntries),
    translationProgress: readonly(translationProgress),
    showOnlyUntranslated,
    untranslatedCount: readonly(untranslatedCount),
    selectNamespace,
    loadNamespaces,
    loadNamespaceTranslations,
    updateTranslation,
    saveAllChanges,
    addTranslationKey,
    deleteTranslationKey,
    addLanguage,
    addAvailableLanguage,
    selectLanguage,
    loadAvailableLanguages,
    toggleUntranslatedFilter,
    dialog
  }
}
