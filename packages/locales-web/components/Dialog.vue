<template>
  <!-- 遮罩层 -->
  <Transition name="dialog-backdrop" enter-active-class="transition-opacity duration-200 ease-out"
    leave-active-class="transition-opacity duration-150 ease-in" enter-from-class="opacity-0"
    enter-to-class="opacity-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="isOpen" class="fixed inset-0 z-50 bg-black bg-opacity-50 dark:bg-opacity-60"
      @click="handleBackdropClick" />
  </Transition>

  <!-- 弹窗容器 -->
  <Transition name="dialog-content" enter-active-class="transition-all duration-200 ease-out"
    leave-active-class="transition-all duration-150 ease-in" enter-from-class="opacity-0 scale-95 translate-y-4"
    enter-to-class="opacity-100 scale-100 translate-y-0" leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-95 translate-y-4">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="handleBackdropClick">
      <!-- 弹窗主体 -->
      <div class="bg-white dark:bg-[#121212] rounded-md shadow-xl max-w-md w-full mx-auto" role="dialog"
        :aria-labelledby="title ? 'dialog-title' : undefined" aria-modal="true" @keydown.esc="handleCancel">
        <!-- 内容区域 -->
        <div class="p-6">
          <!-- 标题 -->
          <h3 v-if="title" id="dialog-title" class="text-lg font-light text-gray-900 dark:text-gray-100 mb-4">
            {{ title }}
          </h3>

          <!-- 消息内容 -->
          <p v-if="message" class="text-gray-700 dark:text-gray-300 mb-6">
            {{ message }}
          </p>

          <!-- 输入框 (仅在 prompt 类型时显示) -->
          <div v-if="type === 'prompt'" class="mb-6">
            <input ref="inputRef" v-model="inputValue" type="text" :placeholder="placeholder"
              class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-colors"
              @keydown.enter="handleConfirm">
          </div>
        </div>

        <!-- 按钮区域 -->
        <div class="flex justify-end gap-3 px-6 pb-6">
          <!-- 取消按钮 -->
          <button v-if="type !== 'alert'" type="button"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-opacity-20"
            @click="handleCancel">
            {{ cancelText }}
          </button>

          <!-- 确定按钮 -->
          <button type="button"
            class="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-opacity-20"
            @click="handleConfirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
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

function handleBackdropClick() {
  // 点击遮罩层关闭弹窗（相当于取消操作）
  handleCancel()
}
</script>