<template>
  <div class="p-3 border-b border-antfu-border">
    <div class="relative max-w-xs">
      <input
        ref="inputRef"
        type="text"
        :placeholder="placeholder"
        :value="searchQuery"
        @input="handleInput"
        @keydown.enter="handleEnterKey"
        @keydown.escape="handleEscapeKey"
        class="w-full px-2 py-1 pl-6 pr-8 text-sm bg-transparent text-antfu-text placeholder-antfu-text-mute focus:outline-none transition-all duration-200"
        :class="[
          isSearching ? 'opacity-75' : '',
          searchQuery ? 'pr-8' : 'pr-2'
        ]"
      />

      <!-- 搜索图标 -->
      <div class="absolute left-1.5 top-1.5 text-antfu-text-mute text-xs opacity-60">
        <div v-if="isSearching" class="i-carbon-circle-dash animate-spin"></div>
        <div v-else class="i-carbon-search"></div>
      </div>

      <!-- 清空按钮 -->
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute right-1.5 top-1.5 text-antfu-text-mute hover:text-antfu-text text-xs opacity-60 hover:opacity-100 transition-all duration-200"
        title="Clear search"
      >
        <div class="i-carbon-close"></div>
      </button>
    </div>

    <!-- 搜索提示 -->
    <div v-if="showSearchHint" class="mt-2 text-xs text-antfu-text-mute opacity-75">
      <div class="flex items-center gap-2">
        <span>Press</span>
        <kbd class="px-1 py-0.5 bg-antfu-bg-soft border border-antfu-border rounded text-xs">Enter</kbd>
        <span>to search immediately or</span>
        <kbd class="px-1 py-0.5 bg-antfu-bg-soft border border-antfu-border rounded text-xs">Esc</kbd>
        <span>to clear</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSearchDebounce } from '~/composables/useDebounce'

interface Props {
  /** 搜索查询值 */
  modelValue: string
  /** 占位符文本 */
  placeholder?: string
  /** 防抖延迟时间（毫秒） */
  debounceDelay?: number
  /** 是否显示搜索提示 */
  showSearchHint?: boolean
}

interface Emits {
  /** 更新搜索查询（防抖后） */
  'update:modelValue': [value: string]
  /** 立即搜索 */
  'search': [value: string]
  /** 清空搜索 */
  'clear': []
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  debounceDelay: 300,
  showSearchHint: false
})

const emit = defineEmits<Emits>()

// 输入框引用
const inputRef = ref<HTMLInputElement>()

// 使用搜索防抖
const {
  searchQuery,
  debouncedSearchQuery,
  isSearching,
  searchImmediately,
  clearSearch: clearSearchDebounce
} = useSearchDebounce(props.modelValue, props.debounceDelay)

// 监听防抖后的搜索查询变化
watch(debouncedSearchQuery, (newValue) => {
  emit('update:modelValue', newValue)
})

// 监听外部 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== searchQuery.value) {
    searchQuery.value = newValue
  }
})

// 处理输入
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
}

// 处理回车键 - 立即搜索
function handleEnterKey() {
  searchImmediately()
  emit('search', searchQuery.value)
}

// 处理 ESC 键 - 清空搜索
function handleEscapeKey() {
  clearSearch()
  inputRef.value?.blur()
}

// 清空搜索
function clearSearch() {
  clearSearchDebounce()
  emit('clear')
}

// 聚焦输入框
function focus() {
  inputRef.value?.focus()
}

// 暴露方法给父组件
defineExpose({
  focus,
  clearSearch
})
</script>
