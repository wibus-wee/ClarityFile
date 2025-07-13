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
          <tr v-for="(item, index) in filteredTranslations" :key="item.key"
            class="group hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
            <!-- Key列 -->
            <td class="px-4 py-2 text-sm font-mono text-gray-900 dark:text-gray-100 align-top">
              <div class="flex items-center gap-2">
                <span>{{ item.key }}</span>
                <button
                  class="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-all">
                  <div class="i-carbon-copy text-xs"></div>
                </button>
              </div>
            </td>

            <!-- 语言列 -->
            <td v-for="language in languages" :key="language.code" class="px-4 py-2 text-sm align-top">
              <div class="relative">
                <textarea v-model="item.translations[language.code]"
                  :placeholder="`Enter ${language.name} translation...`"
                  class="w-full px-2 py-1 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none border-none"
                  rows="1" @input="markAsChanged(item.key, language.code)"
                  @blur="saveTranslation(item.key, language.code, item.translations[language.code])"></textarea>
                <div v-if="item.translations[language.code]" class="absolute top-2 right-2 w-2 h-2 rounded-full"
                  :class="getTranslationStatus(item.key, language.code) === 'changed' ? 'bg-amber-400' : 'bg-emerald-400'">
                </div>
              </div>
            </td>

            <!-- Actions列 -->
            <td class="px-4 py-2 text-sm align-top">
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                  @click="deleteKey(item.key)">
                  <div class="i-carbon-trash-can text-xs"></div>
                </button>
                <button
                  class="p-1 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-all"
                  @click="duplicateKey(item.key)">
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
const changedKeys = ref(new Set())

// 模拟翻译数据
const translations = ref([
  {
    key: 'title',
    translations: {
      'zh-CN': '文件管理',
      'en-US': 'File Management'
    }
  },
  {
    key: 'upload',
    translations: {
      'zh-CN': '上传文件',
      'en-US': 'Upload File'
    }
  },
  {
    key: 'fileTypes.document',
    translations: {
      'zh-CN': '文档',
      'en-US': 'Document'
    }
  },
  {
    key: 'fileTypes.image',
    translations: {
      'zh-CN': '图片',
      'en-US': 'Image'
    }
  },
  {
    key: 'fileTypes.video',
    translations: {
      'zh-CN': '视频',
      'en-US': 'Video'
    }
  },
  {
    key: 'actions.selectAll',
    translations: {
      'zh-CN': '全选',
      'en-US': 'Select All'
    }
  },
  {
    key: 'actions.delete',
    translations: {
      'zh-CN': '删除',
      'en-US': 'Delete'
    }
  }
])

const filteredTranslations = computed(() => {
  if (!searchQuery.value) return translations.value

  return translations.value.filter(item =>
    item.key.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    Object.values(item.translations).some(translation =>
      translation.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  )
})

function markAsChanged(key, languageCode) {
  changedKeys.value.add(`${key}:${languageCode}`)
}

function getTranslationStatus(key, languageCode) {
  return changedKeys.value.has(`${key}:${languageCode}`) ? 'changed' : 'saved'
}

function saveTranslation(key, languageCode, value) {
  // 模拟保存API调用
  setTimeout(() => {
    changedKeys.value.delete(`${key}:${languageCode}`)
    console.log('Saved:', { key, languageCode, value })
  }, 500)
}

function deleteKey(key) {
  if (confirm(`Are you sure you want to delete "${key}"?`)) {
    const index = translations.value.findIndex(item => item.key === key)
    if (index > -1) {
      translations.value.splice(index, 1)
    }
  }
}

function duplicateKey(key) {
  const original = translations.value.find(item => item.key === key)
  if (original) {
    const newKey = `${key}_copy`
    translations.value.push({
      key: newKey,
      translations: { ...original.translations }
    })
  }
}
</script>
