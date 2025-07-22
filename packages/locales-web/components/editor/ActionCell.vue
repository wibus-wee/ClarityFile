<template>
  <td class="px-4 py-2 align-top">
    <div class="flex items-center gap-1">
      <!-- 删除按钮 -->
      <button
        @click="handleDelete"
        class="p-1 opacity-0 group-hover:opacity-100 text-antfu-text-mute hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
        title="删除此翻译键"
      >
        <div class="i-carbon-trash-can text-xs"></div>
      </button>
      
      <!-- 复制按钮 -->
      <button
        @click="handleCopy"
        class="p-1 opacity-0 group-hover:opacity-100 text-antfu-text-mute hover:text-antfu-text hover:bg-antfu-soft rounded transition-all"
        title="复制翻译键路径"
      >
        <div class="i-carbon-copy text-xs"></div>
      </button>
      
      <!-- 编辑按钮（用于复杂类型） -->
      <button
        v-if="showEditButton"
        @click="handleEdit"
        class="p-1 opacity-0 group-hover:opacity-100 text-antfu-text-mute hover:text-antfu-text hover:bg-antfu-soft rounded transition-all"
        title="编辑"
      >
        <div class="i-carbon-edit text-xs"></div>
      </button>
      
      <!-- 修改状态指示器 -->
      <div
        v-if="isModified"
        class="w-2 h-2 bg-emerald-500 rounded-full"
        title="已修改"
      ></div>
    </div>
  </td>
</template>

<script setup lang="ts">
import type { TranslationEntry } from '~/types'

interface Props {
  /** 翻译条目 */
  entry: TranslationEntry
  /** 条目索引 */
  index: number
  /** 是否显示编辑按钮 */
  showEditButton?: boolean
}

interface Emits {
  /** 删除条目 */
  'delete': [index: number]
  /** 复制路径 */
  'copy': [path: string]
  /** 编辑条目 */
  'edit': [entry: TranslationEntry]
}

const props = withDefaults(defineProps<Props>(), {
  showEditButton: false
})

const emit = defineEmits<Emits>()

const isModified = computed(() => props.entry.isModified)

async function handleDelete() {
  // 可以添加确认对话框
  const confirmed = confirm(`确定要删除翻译键 "${props.entry.path}" 吗？`)
  if (confirmed) {
    emit('delete', props.index)
  }
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.entry.path)
    emit('copy', props.entry.path)
    // 可以显示成功提示
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

function handleEdit() {
  emit('edit', props.entry)
}
</script>
