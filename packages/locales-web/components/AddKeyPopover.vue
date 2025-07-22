<template>
  <div class="relative">
    <!-- 触发按钮 -->
    <button @click="togglePopover"
      class="px-2 py-1 text-sm text-antfu-text-soft hover:text-antfu-text hover:bg-antfu-soft rounded transition-all flex items-center gap-1.5">
      <div class="i-carbon-add text-xs"></div>
      Add Key
    </button>

    <!-- Popover -->
    <div v-if="isOpen"
      class="absolute top-full left-0 mt-2 w-80 bg-antfu-bg border border-antfu-border rounded-lg shadow-lg z-50">
      <!-- 箭头 -->
      <div class="absolute -top-1 left-4 w-2 h-2 bg-antfu-bg border-l border-t border-antfu-border rotate-45"></div>

      <!-- 内容 -->
      <div class="p-4">
        <h3 class="text-sm font-medium text-antfu-text mb-3">
          Add New Translation Key
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-3">
          <!-- 键名输入 -->
          <div>
            <label class="block text-xs text-antfu-text-mute mb-1">
              Key Name
            </label>
            <input ref="keyInput" v-model="keyName" type="text" placeholder="e.g., actions.newAction"
              class="w-full px-3 py-2 text-sm border border-antfu-border bg-antfu-bg text-antfu-text rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': error }" />
            <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
          </div>

          <!-- 基础语言翻译 -->
          <div>
            <label class="block text-xs text-antfu-text-mute mb-1">
              {{ baseLanguage }} Translation
            </label>
            <input v-model="baseTranslation" type="text" placeholder="Enter translation..."
              class="w-full px-3 py-2 text-sm border border-antfu-border bg-antfu-bg text-antfu-text rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>

          <!-- 按钮 -->
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" @click="closePopover"
              class="px-3 py-1.5 text-xs text-antfu-text-soft hover:text-antfu-text border border-antfu-border hover:border-antfu-border rounded transition-all">
              Cancel
            </button>
            <button type="submit" :disabled="!keyName.trim()"
              class="px-3 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition-all">
              Add Key
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 背景遮罩 -->
    <div v-if="isOpen" @click="closePopover" class="fixed inset-0 z-40"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  namespace: {
    type: String,
    required: true
  },
  baseLanguage: {
    type: String,
    default: 'zh-CN'
  }
})

const emit = defineEmits(['add-key'])

const isOpen = ref(false)
const keyName = ref('')
const baseTranslation = ref('')
const error = ref('')
const keyInput = ref(null)

const togglePopover = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      keyInput.value?.focus()
    })
  }
}

const closePopover = () => {
  isOpen.value = false
  keyName.value = ''
  baseTranslation.value = ''
  error.value = ''
}

const validateKeyName = (name) => {
  if (!name.trim()) {
    return 'Key name is required'
  }

  // 检查键名格式
  if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(name)) {
    return 'Key name must start with a letter and contain only letters, numbers, dots, underscores, and hyphens'
  }

  return null
}

const handleSubmit = () => {
  const validationError = validateKeyName(keyName.value)
  if (validationError) {
    error.value = validationError
    return
  }

  // 发送添加键事件
  emit('add-key', {
    key: keyName.value.trim(),
    translation: baseTranslation.value.trim(),
    namespace: props.namespace
  })

  closePopover()
}

// 点击外部关闭
onMounted(() => {
  const handleClickOutside = (event) => {
    if (isOpen.value && !event.target.closest('.relative')) {
      closePopover()
    }
  }

  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>
