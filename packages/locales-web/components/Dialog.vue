<template>
  <!-- antfu风格：极简的内联输入，不是大型弹窗 -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- 极轻微的背景遮罩 -->
      <div class="absolute inset-0 bg-black/5 dark:bg-black/20" @click="handleCancel"></div>

      <!-- 极简的输入卡片 - 学习antfu的项目卡片设计 -->
      <div class="relative bg-white dark:bg-gray-900 rounded p-3 w-full max-w-xs">
        <div v-if="title" class="text-sm text-gray-900 dark:text-gray-100 mb-2">
          {{ title }}
        </div>

        <div v-if="message" class="text-xs text-gray-600 dark:text-gray-400 mb-3">
          {{ message }}
        </div>

        <div v-if="type === 'prompt'" class="mb-3">
          <input ref="inputRef" v-model="inputValue" type="text" :placeholder="placeholder"
            class="w-full px-2 py-1 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded focus:outline-none"
            @keydown.enter="handleConfirm" @keydown.escape="handleCancel">
        </div>

        <div class="flex gap-2 justify-end">
          <button @click="handleCancel"
            class="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded">
            {{ cancelText }}
          </button>
          <button @click="handleConfirm"
            class="px-2 py-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'alert', // 'alert' | 'confirm' | 'prompt'
    validator: (value) => ['alert', 'confirm', 'prompt'].includes(value)
  },
  placeholder: {
    type: String,
    default: ''
  },
  defaultValue: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const inputRef = ref(null)
const inputValue = ref('')

// 监听弹窗打开，自动聚焦输入框
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    inputValue.value = props.defaultValue
    if (props.type === 'prompt') {
      await nextTick()
      inputRef.value?.focus()
      inputRef.value?.select()
    }
  }
})

function handleConfirm() {
  if (props.type === 'prompt') {
    emit('confirm', inputValue.value)
  } else {
    emit('confirm')
  }
  emit('close')
}

function handleCancel() {
  emit('cancel')
  emit('close')
}
</script>