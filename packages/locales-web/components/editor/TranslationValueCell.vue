<template>
  <td class="px-4 py-2 align-top">
    <div class="relative">
      <!-- 简单字符串编辑器 -->
      <template v-if="entry.type === 'string'">
        <textarea 
          :value="entry.values[language.code] || ''"
          @input="handleTextareaInput"
          :placeholder="`输入 ${language.code} 翻译...`"
          class="w-full px-2 py-1 text-sm border-0 bg-transparent text-antfu-text placeholder-antfu-text-mute resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
          :class="getFieldClass(entry.values[language.code], language.isBase)" 
          rows="1"
          @focus="autoResize"
        ></textarea>
      </template>

      <!-- 数组编辑器 -->
      <template v-else-if="entry.type === 'array'">
        <!-- 展开状态：显示完整的数组编辑器 -->
        <div v-if="isExpanded" class="min-h-8 p-3 rounded">
          <ArrayEditor 
            :model-value="entry.values[language.code] || []"
            @update:model-value="handleArrayUpdate" 
          />
        </div>
        <!-- 折叠状态：显示数组摘要 -->
        <div 
          v-else
          class="min-h-8 p-2 text-sm text-antfu-text-mute cursor-pointer hover:bg-antfu-bg-soft rounded transition-all"
          @click="$emit('toggle-expanded', entry.path)"
        >
          <div v-if="Array.isArray(entry.values[language.code]) && entry.values[language.code].length > 0">
            <div class="text-xs opacity-60 mb-1">{{ entry.values[language.code].length }} items</div>
            <div class="text-xs truncate">
              {{ entry.values[language.code].slice(0, 2).join(', ') }}
              <span v-if="entry.values[language.code].length > 2">...</span>
            </div>
          </div>
          <div v-else class="text-xs opacity-40">Empty array</div>
          <div class="text-xs opacity-40 mt-1 flex items-center gap-1">
            <div class="i-carbon-chevron-right text-xs"></div>
            <span>Click to expand</span>
          </div>
        </div>
      </template>

      <!-- JSON 编辑器（对象类型） -->
      <template v-else-if="entry.type === 'object'">
        <JsonEditor 
          :model-value="entry.values[language.code] || {}"
          @update:model-value="handleObjectUpdate"
        />
      </template>

      <!-- 其他类型的简单编辑器 -->
      <template v-else>
        <input 
          :value="entry.values[language.code] || ''"
          @input="handleSimpleInput"
          :type="getInputType(entry.type)"
          :placeholder="`输入 ${language.code} 翻译...`"
          class="w-full px-2 py-1 text-sm border-0 bg-transparent text-antfu-text placeholder-antfu-text-mute focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
          :class="getFieldClass(entry.values[language.code], language.isBase)"
        />
      </template>
    </div>
  </td>
</template>

<script setup lang="ts">
import type { TranslationEntry, Language } from '~/types'
import ArrayEditor from '~/components/ArrayEditor.vue'
import JsonEditor from '~/components/JsonEditor.vue'

interface Props {
  /** 翻译条目 */
  entry: TranslationEntry
  /** 当前语言 */
  language: Language
  /** 是否展开（用于数组类型） */
  isExpanded?: boolean
}

interface Emits {
  /** 更新翻译值 */
  'update-translation': [path: string, languageCode: string, value: any]
  /** 切换展开状态 */
  'toggle-expanded': [path: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleTextareaInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update-translation', props.entry.path, props.language.code, target.value)
}

function handleArrayUpdate(value: string[]) {
  emit('update-translation', props.entry.path, props.language.code, value)
}

function handleObjectUpdate(value: Record<string, any>) {
  emit('update-translation', props.entry.path, props.language.code, value)
}

function handleSimpleInput(event: Event) {
  const target = event.target as HTMLInputElement
  let value: any = target.value
  
  // 根据类型转换值
  if (props.entry.type === 'number') {
    value = Number(value)
  } else if (props.entry.type === 'boolean') {
    value = target.checked
  }
  
  emit('update-translation', props.entry.path, props.language.code, value)
}

function getInputType(type: string): string {
  switch (type) {
    case 'number':
      return 'number'
    case 'boolean':
      return 'checkbox'
    default:
      return 'text'
  }
}

function getFieldClass(value: any, isBase?: boolean): string {
  const classes = []
  
  if (isUntranslated(value)) {
    classes.push('bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800')
  }
  
  if (isBase) {
    classes.push('font-medium')
  }
  
  return classes.join(' ')
}

function isUntranslated(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

function autoResize(event: Event) {
  const target = event.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = target.scrollHeight + 'px'
}
</script>
