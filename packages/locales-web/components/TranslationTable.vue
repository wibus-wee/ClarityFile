<template>
  <div class="h-full">
    <!-- 搜索栏 - antfu极简风格 -->
    <div class="p-3 border-b border-gray-100 dark:border-gray-800">
      <div class="relative max-w-xs">
        <input type="text" placeholder="Search..." v-model="searchQuery"
          class="w-full px-2 py-1 pl-6 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none">
        <div class="absolute left-1.5 top-1.5 i-carbon-search text-gray-400 text-xs opacity-60"></div>
      </div>
    </div>

    <!-- 表格编辑器 -->
    <div class="overflow-auto">
      <table class="w-full">
        <thead class="sticky top-0 bg-white dark:bg-black">
          <tr>
            <th
              class="px-4 py-2 text-left text-xs font-light text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800 w-64 opacity-75">
              Key
            </th>
            <th v-for="language in languages" :key="language.code"
              class="px-4 py-2 text-left text-xs font-light text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800 min-w-80 opacity-75">
              {{ language.name }}
              <span class="font-normal ml-1 opacity-50">({{ language.code }})</span>
            </th>
            <th
              class="px-4 py-2 text-left text-xs font-light text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800 w-20 opacity-75">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="(item, index) in filteredTranslations" :key="item.path"
            class="group hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
            <!-- Key列 -->
            <td class="px-4 py-2 text-sm font-mono text-gray-900 dark:text-gray-100 align-top">
              <div class="flex items-center gap-2">
                <div>
                  <div class="font-medium">{{ item.key }}</div>
                  <div class="text-xs text-gray-400 dark:text-gray-500 opacity-75">{{ item.path }}</div>
                </div>
                <button
                  class="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-all"
                  @click="copyToClipboard(item.path)">
                  <div class="i-carbon-copy text-xs"></div>
                </button>
              </div>
            </td>

            <!-- 语言列 -->
            <td v-for="language in languages" :key="language.code" class="px-4 py-2 text-sm align-top">
              <div class="relative">
                <textarea :value="item.values[language.code]" :placeholder="`输入 ${language.name} 翻译...`"
                  class="w-full px-2 py-1 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none border-none"
                  rows="1" @input="markAsChanged(index, language.code, $event.target.value)"
                  @blur="saveTranslation(index, language.code, $event.target.value)">
                </textarea>
                <div v-if="item.values[language.code]" class="absolute top-2 right-2 w-2 h-2 rounded-full"
                  :class="getTranslationStatus(index, language.code) === 'changed' ? 'bg-amber-400' : 'bg-emerald-400'">
                </div>
              </div>
            </td>

            <!-- Actions列 -->
            <td class="px-4 py-2 text-sm align-top">
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                  @click="deleteKey(index)">
                  <div class="i-carbon-trash-can text-xs"></div>
                </button>
                <button
                  class="p-1 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-all"
                  @click="duplicateKey(index)">
                  <div class="i-carbon-copy text-xs"></div>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  namespace: {
    type: String,
    required: true
  },
  languages: {
    type: Array,
    required: true
  }
})

const searchQuery = ref('')
const translations = useTranslations()

// 从 composable 获取数据
const { translationEntries, updateTranslation, deleteTranslationKey } = translations

// 监听命名空间变化，重新加载数据
watch(() => props.namespace, async (newNamespace) => {
  if (newNamespace) {
    await translations.loadNamespaceTranslations(newNamespace)
  }
}, { immediate: true })

const filteredTranslations = computed(() => {
  if (!searchQuery.value) return translationEntries.value

  return translationEntries.value.filter(item =>
    item.key.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.path.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    Object.values(item.values).some(translation =>
      translation.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  )
})

function markAsChanged(entryIndex, languageCode, value) {
  updateTranslation(entryIndex, languageCode, value)
}

function getTranslationStatus(entryIndex, languageCode) {
  const entry = translationEntries.value[entryIndex]
  return entry?.isModified ? 'changed' : 'saved'
}

function saveTranslation(entryIndex, languageCode, value) {
  // 实时更新，保存会在用户点击保存按钮时统一处理
  updateTranslation(entryIndex, languageCode, value)
}

function deleteKey(entryIndex) {
  const entry = translationEntries.value[entryIndex]
  if (entry && confirm(`确定要删除 "${entry.path}" 吗？`)) {
    deleteTranslationKey(entryIndex)
  }
}

function duplicateKey(entryIndex) {
  const entry = translationEntries.value[entryIndex]
  if (entry) {
    const newPath = `${entry.path}_copy`
    translations.addTranslationKey(newPath)
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('已复制到剪贴板:', text)
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>
