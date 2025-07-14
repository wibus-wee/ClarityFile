<template>
  <div class="h-full">
    <!-- 搜索栏 -->
    <div class="p-3 border-b border-antfu-border">
      <div class="relative max-w-xs">
        <input type="text" placeholder="Search..." v-model="searchQuery"
          class="w-full px-2 py-1 pl-6 text-sm bg-transparent text-antfu-text placeholder-antfu-text-mute focus:outline-none" />
        <div class="absolute left-1.5 top-1.5 i-carbon-search text-antfu-text-mute text-xs opacity-60"></div>
      </div>
    </div>

    <!-- 表格编辑器 -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-auto">
        <table class="w-full table-fixed">
          <thead class="sticky top-0 bg-antfu-bg">
            <tr>
              <th
                class="px-4 py-2 text-left text-xs font-light text-antfu-text-mute border-b border-antfu-border w-64 opacity-75">
                Key
              </th>
              <th v-for="language in languages" :key="language.code"
                class="px-4 py-2 text-left text-xs font-light text-antfu-text-mute border-b border-antfu-border opacity-75"
                :style="{ width: `${Math.max(200, 400 / languages.length)}px` }">
                {{ language.name }}
                <span class="font-normal ml-1 opacity-50">({{ language.code }})</span>
                <span v-if="language.isBase" class="ml-1 text-emerald-500 opacity-75">*</span>
              </th>
              <th
                class="px-4 py-2 text-left text-xs font-light text-antfu-text-mute border-b border-antfu-border w-20 opacity-75">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-antfu-border">
            <tr v-for="(item, index) in filteredTranslations" :key="item.path" class="group hover:bg-antfu-bg-soft">
              <!-- Key列 -->
              <td class="px-4 py-2 text-sm font-mono text-gray-900 dark:text-gray-100 align-top">
                <div class="flex items-center gap-2">
                  <div>
                    <div class="font-medium">{{ item.key }}</div>
                    <div class="text-xs text-gray-400 dark:text-gray-500 opacity-75">{{ item.path }}</div>
                    <div v-if="item.type !== 'string'" class="text-xs text-blue-500 dark:text-blue-400 opacity-75">
                      {{ item.type }}
                    </div>
                  </div>
                  <button
                    class="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-all"
                    @click="copyToClipboard(item.path)">
                    <div class="i-carbon-copy text-xs"></div>
                  </button>
                </div>
              </td>

              <!-- 语言列 -->
              <td v-for="language in languages" :key="language.code" class="px-4 py-2 align-top">
                <div class="relative">
                  <!-- 简单字符串编辑器 -->
                  <template v-if="item.type === 'string'">
                    <textarea :value="item.values[language.code] || ''"
                      @input="handleTextareaInput(item.path, language.code, $event)"
                      :placeholder="`输入 ${language.code} 翻译...`"
                      class="w-full px-2 py-1 text-sm border-0 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                      :class="getFieldClass(item.values[language.code], language.isBase)" rows="1"
                      @focus="autoResize"></textarea>
                  </template>

                  <!-- 数组编辑器 -->
                  <template v-else-if="item.type === 'array'">
                    <div class="min-h-8 p-2 border border-gray-200 dark:border-gray-600 rounded">
                      <ArrayEditor :model-value="item.values[language.code] || []"
                        @update:model-value="updateTranslation(item.path, language.code, $event)" />
                    </div>
                  </template>

                  <!-- 其他复杂数据结构编辑器 -->
                  <template v-else>
                    <div class="min-h-8 p-2 border border-gray-200 dark:border-gray-600 rounded">
                      <JsonEditor :model-value="item.values[language.code]"
                        @update:model-value="updateTranslation(item.path, language.code, $event)"
                        :placeholder="`输入 ${language.code} 翻译...`" />
                    </div>
                  </template>

                  <!-- 未翻译指示器 -->
                  <div v-if="!language.isBase && isUntranslated(item.values[language.code])"
                    class="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"></div>
                </div>
              </td>

              <!-- 操作列 -->
              <td class="px-4 py-2 align-top">
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="duplicateEntry(item)"
                    class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-all"
                    title="Duplicate">
                    <div class="i-carbon-copy text-xs"></div>
                  </button>
                  <button @click="deleteEntry(item.path)"
                    class="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                    title="Delete">
                    <div class="i-carbon-trash-can text-xs"></div>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 空状态 -->
        <div v-if="filteredTranslations.length === 0" class="flex-center h-32 text-gray-400 dark:text-gray-500">
          <div class="text-center">
            <div class="i-carbon-search text-2xl mb-2 opacity-30 mx-auto"></div>
            <p class="text-sm">{{ searchQuery ? 'No matching translations found' : 'No translations available' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTranslations } from '~/composables/useTranslations'

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

// 搜索查询
const searchQuery = ref('')

// 使用翻译数据
const {
  filteredTranslationEntries,
  updateTranslation,
  deleteEntry
} = useTranslations()

// 过滤后的翻译条目
const filteredTranslations = computed(() => {
  // 首先获取基于筛选状态的条目
  let entries = filteredTranslationEntries.value || []

  // 然后应用搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    entries = entries.filter(entry =>
      entry.key.toLowerCase().includes(query) ||
      entry.path.toLowerCase().includes(query) ||
      Object.values(entry.values).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(query)
      )
    )
  }

  return entries
})

// 获取字段样式类
function getFieldClass(value, isBase) {
  if (isBase) {
    return 'bg-emerald-50/50 dark:bg-emerald-900/10'
  }
  if (isUntranslated(value)) {
    return 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
  }
  return ''
}

// 检查是否未翻译
function isUntranslated(value) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// 处理文本域输入
function handleTextareaInput(path, languageCode, event) {
  updateTranslation(path, languageCode, event.target.value)
  autoResize(event)
}

// 自动调整文本域高度
function autoResize(event) {
  const textarea = event.target
  textarea.style.height = 'auto'
  textarea.style.height = Math.max(24, textarea.scrollHeight) + 'px'
}

// 复制到剪贴板
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    // TODO: 显示成功提示
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// 复制条目
function duplicateEntry(item) {
  // TODO: 实现复制条目逻辑
  console.log('Duplicate entry:', item)
}
</script>
