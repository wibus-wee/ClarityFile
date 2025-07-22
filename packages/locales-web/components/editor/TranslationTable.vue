<template>
  <div class="h-full">
    <!-- 搜索栏 -->
    <SearchBar
      v-model="debouncedSearchQuery"
      :debounce-delay="300"
      :show-search-hint="true"
      @search="handleImmediateSearch"
      @clear="handleClearSearch"
    />

    <!-- 表格编辑器 -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-auto">
        <table class="w-full table-fixed">
          <!-- 表格头部 -->
          <TableHeader :languages="languages" />
          
          <!-- 表格主体 -->
          <tbody class="divide-y divide-antfu-border">
            <tr 
              v-for="(item, index) in filteredTranslations" 
              :key="item.path" 
              class="group hover:bg-antfu-soft"
            >
              <!-- 翻译键列 -->
              <TranslationKeyCell
                :entry="item"
                :languages="languages"
                :is-expanded="expandedItems.has(item.path)"
                @toggle-expanded="toggleExpanded"
                @copy="handleCopyPath"
              />

              <!-- 翻译值列 -->
              <TranslationValueCell
                v-for="language in languages"
                :key="language.code"
                :entry="item"
                :language="language"
                :is-expanded="expandedItems.has(item.path)"
                @update-translation="handleUpdateTranslation"
                @toggle-expanded="toggleExpanded"
              />

              <!-- 操作列 -->
              <ActionCell
                :entry="item"
                :index="index"
                :show-edit-button="item.type === 'object'"
                @delete="handleDeleteEntry"
                @copy="handleCopyPath"
                @edit="handleEditEntry"
              />
            </tr>
          </tbody>
        </table>

        <!-- 空状态 -->
        <div v-if="filteredTranslations.length === 0" class="text-center py-16">
          <div class="text-antfu-text-mute mb-4">
            <div class="i-carbon-document-blank text-4xl mb-3 mx-auto opacity-50"></div>
            <p class="text-sm">{{ debouncedSearchQuery ? 'No matching translations found' : 'No translations available' }}</p>
            <p v-if="debouncedSearchQuery" class="text-xs mt-1 opacity-75">Try adjusting your search query</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslationsNew } from '~/composables/useTranslationsNew'
import type { Language, TranslationEntry } from '~/types'

// 导入子组件
import SearchBar from './SearchBar.vue'
import TableHeader from './TableHeader.vue'
import TranslationKeyCell from './TranslationKeyCell.vue'
import TranslationValueCell from './TranslationValueCell.vue'
import ActionCell from './ActionCell.vue'

interface Props {
  /** 命名空间名称 */
  namespace: string
  /** 语言列表 */
  languages: Language[]
}

const props = defineProps<Props>()

// 使用翻译数据
const {
  filteredTranslationEntries,
  updateTranslation,
  deleteTranslationKey,
  showOnlyUntranslated
} = useTranslationsNew()

// 搜索防抖
const debouncedSearchQuery = ref('')

// 展开的项目集合
const expandedItems = ref(new Set<string>())

// 筛选后的翻译条目
const filteredTranslations = computed(() => {
  let entries = filteredTranslationEntries.value

  // 应用搜索筛选
  if (debouncedSearchQuery.value.trim()) {
    const query = debouncedSearchQuery.value.toLowerCase()
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

// 切换展开状态
function toggleExpanded(path: string) {
  if (expandedItems.value.has(path)) {
    expandedItems.value.delete(path)
  } else {
    expandedItems.value.add(path)
  }
}

// 处理翻译更新
function handleUpdateTranslation(path: string, languageCode: string, value: any) {
  // 直接传递路径，让 updateTranslation 函数根据路径查找条目
  updateTranslation(path, languageCode, value)
}

// 处理删除条目
function handleDeleteEntry(index: number) {
  const entry = filteredTranslations.value[index]
  if (entry) {
    // 直接传递路径，让 deleteTranslationKey 函数根据路径查找条目
    deleteTranslationKey(entry.path)
  }
}

// 处理复制路径
function handleCopyPath(path: string) {
  // 可以显示成功提示
  console.log('Copied path:', path)
}

// 处理编辑条目
function handleEditEntry(entry: TranslationEntry) {
  // 可以打开编辑对话框
  console.log('Edit entry:', entry)
}

// 处理立即搜索
function handleImmediateSearch(query: string) {
  console.log('Immediate search:', query)
  // 可以添加搜索分析或日志记录
}

// 处理清空搜索
function handleClearSearch() {
  console.log('Search cleared')
  // 可以添加清空搜索的额外逻辑
}
</script>
