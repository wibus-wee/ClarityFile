<template>
  <td class="px-4 py-2 text-sm font-mono text-antfu-text align-top">
    <div class="flex items-center gap-2">
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <!-- 展开/折叠按钮（仅数组类型显示） -->
          <button 
            v-if="entry.type === 'array'" 
            @click="$emit('toggle-expanded', entry.path)"
            class="p-1 text-antfu-text-mute hover:text-antfu-text hover:bg-antfu-soft rounded transition-all"
          >
            <div 
              :class="isExpanded ? 'i-carbon-chevron-down' : 'i-carbon-chevron-right'"
              class="text-xs"
            ></div>
          </button>
          <div class="font-medium">{{ entry.key }}</div>
        </div>
        <div class="text-xs text-antfu-text-mute opacity-75 max-w-68 truncate">{{ entry.path }}</div>
        <div v-if="entry.type !== 'string'" class="text-xs text-blue-500 dark:text-blue-400 opacity-75">
          {{ entry.type }}
          <span v-if="entry.type === 'array' && Array.isArray(entry.values[firstLanguageCode])">
            ({{ entry.values[firstLanguageCode].length }} items)
          </span>
        </div>
      </div>
      <button
        class="p-1 opacity-0 group-hover:opacity-100 text-antfu-text-mute hover:text-antfu-text hover:bg-antfu-soft rounded transition-all"
        @click="copyToClipboard"
        :title="`Copy path: ${entry.path}`"
      >
        <div class="i-carbon-copy text-xs"></div>
      </button>
    </div>
  </td>
</template>

<script setup lang="ts">
import type { TranslationEntry, Language } from '~/types'

interface Props {
  /** 翻译条目 */
  entry: TranslationEntry
  /** 语言列表 */
  languages: Language[]
  /** 是否展开（用于数组类型） */
  isExpanded?: boolean
}

interface Emits {
  /** 切换展开状态 */
  'toggle-expanded': [path: string]
  /** 复制到剪贴板 */
  'copy': [path: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 获取第一个语言的代码，用于显示数组长度
const firstLanguageCode = computed(() => props.languages[0]?.code || '')

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.entry.path)
    emit('copy', props.entry.path)
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}
</script>
