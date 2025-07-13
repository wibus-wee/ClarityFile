import { ref, computed, watch } from 'vue'

interface Language {
  code: string
  name: string
  isBase?: boolean
}

interface TranslationEntry {
  key: string
  path: string
  values: Record<string, string>
  isModified: boolean
}

export const useTranslations = () => {
  const fileSystem = useFileSystem()
  const dialog = useDialog()

  const activeNamespace = ref<string>('')
  // 改为单选模式 - 当前编辑的语言
  const currentLanguage = ref<string>('en-US')
  const availableLanguages = ref<Language[]>([
    { code: 'zh-CN', name: '简体中文', isBase: true },
    { code: 'en-US', name: 'English' }
  ])

  // 当前显示的语言列表（基准语言 + 当前选中语言）
  const languages = computed(() => {
    const baseLanguage = availableLanguages.value.find((lang) => lang.isBase)
    const currentLang = availableLanguages.value.find((lang) => lang.code === currentLanguage.value)

    const result = []
    if (baseLanguage) result.push(baseLanguage)
    if (currentLang && currentLang.code !== baseLanguage?.code) result.push(currentLang)

    return result
  })

  // 基准语言
  const baseLanguage = computed(
    () => availableLanguages.value.find((lang) => lang.isBase) || availableLanguages.value[0]
  )

  const translationEntries = ref<TranslationEntry[]>([])
  const isLoading = ref(false)
  const hasUnsavedChanges = ref(false)

  // 计算属性
  const modifiedEntries = computed(() =>
    translationEntries.value.filter((entry) => entry.isModified)
  )

  const translationProgress = computed(() => {
    const total = translationEntries.value.length * languages.value.length
    const completed = translationEntries.value.reduce((count, entry) => {
      return (
        count +
        languages.value.filter((lang) => entry.values[lang.code] && entry.values[lang.code].trim())
          .length
      )
    }, 0)

    return total > 0 ? Math.round((completed / total) * 100) : 0
  })

  // 选择命名空间
  const selectNamespace = async (namespace: string) => {
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
    translationEntries.value = []

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
      translationEntries.value = Array.from(allKeys).map((key) => ({
        key: key.split('.').pop() || key,
        path: key,
        values: languages.value.reduce(
          (acc, lang) => {
            acc[lang.code] = getValueByPath(translationData[lang.code] || {}, key) || ''
            return acc
          },
          {} as Record<string, string>
        ),
        isModified: false
      }))
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

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        collectKeys(obj[key], fullKey, keys)
      } else {
        keys.add(fullKey)
      }
    })
  }

  // 根据路径获取值
  const getValueByPath = (obj: any, path: string): string => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : ''
    }, obj)
  }

  // 根据路径设置值
  const setValueByPath = (obj: any, path: string, value: string) => {
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
        {} as Record<string, string>
      ),
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
      availableLanguages.value[1]
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
    if (!selectedLanguages.value.includes(code)) {
      selectedLanguages.value.push(code)
    }

    // 为所有现有条目添加新语言的空值
    translationEntries.value.forEach((entry) => {
      entry.values[code] = ''
      entry.isModified = true
    })

    hasUnsavedChanges.value = true
    return true
  }

  // 兼容旧的addLanguage方法
  const addLanguage = addAvailableLanguage

  return {
    activeNamespace: readonly(activeNamespace),
    currentLanguage: readonly(currentLanguage),
    availableLanguages: readonly(availableLanguages),
    languages: readonly(languages),
    baseLanguage: readonly(baseLanguage),
    getCurrentLanguage: readonly(getCurrentLanguage),
    translationEntries: readonly(translationEntries),
    isLoading: readonly(isLoading),
    hasUnsavedChanges: readonly(hasUnsavedChanges),
    modifiedEntries: readonly(modifiedEntries),
    translationProgress: readonly(translationProgress),
    selectNamespace,
    loadNamespaceTranslations,
    updateTranslation,
    saveAllChanges,
    addTranslationKey,
    deleteTranslationKey,
    addLanguage,
    addAvailableLanguage,
    selectLanguage,
    dialog
  }
}
