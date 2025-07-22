<template>
  <div class="relative">
    <!-- 触发按钮 -->
    <button @click="togglePopover"
      class="px-2 py-1 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-all flex items-center gap-1.5">
      <div class="i-carbon-language text-xs"></div>
      Add Language
    </button>

    <!-- Popover -->
    <div v-if="isOpen"
      class="absolute top-full right-0 mt-2 w-80 bg-antfu-bg border border-antfu-border rounded-lg shadow-lg z-50">
      <!-- 箭头 -->
      <div class="absolute -top-1 right-4 w-2 h-2 bg-antfu-bg border-l border-t border-antfu-border rotate-45"></div>

      <!-- 内容 -->
      <div class="p-4">
        <h3 class="text-sm font-medium text-antfu-text mb-3">
          Add New Language
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-3">
          <!-- 语言代码输入 -->
          <div>
            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Language Code
            </label>
            <input ref="codeInput" v-model="languageCode" type="text" placeholder="e.g., fr-FR, ja-JP, de-DE"
              class="w-full px-3 py-2 text-sm border bg-antfu-bg text-antfu-text border-antfu-border rounded focus:ring-1 focus:ring-emerald-500"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': error }" />
            <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
          </div>

          <!-- 语言名称 -->
          <div>
            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Display Name
            </label>
            <input v-model="languageName" type="text" placeholder="e.g., Français, 日本語, Deutsch"
              class="w-full px-3 py-2 text-sm border bg-antfu-bg text-antfu-text border-antfu-border rounded focus:ring-1 focus:ring-emerald-500" />
          </div>

          <!-- 常用语言快捷选择 -->
          <div>
            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-2">
              Common Languages
            </label>
            <div class="grid grid-cols-2 gap-1">
              <button v-for="lang in commonLanguages" :key="lang.code" type="button" @click="selectLanguage(lang)"
                class="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded transition-all text-left">
                <div class="font-mono">{{ lang.code }}</div>
                <div class="text-xs opacity-60">{{ lang.name }}</div>
              </button>
            </div>
          </div>

          <!-- 按钮 -->
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" @click="closePopover"
              class="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded transition-all">
              Cancel
            </button>
            <button type="submit" :disabled="!languageCode.trim()"
              class="px-3 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition-all">
              Add Language
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
const emit = defineEmits(['add-language'])

const isOpen = ref(false)
const languageCode = ref('')
const languageName = ref('')
const error = ref('')
const codeInput = ref(null)

// 常用语言列表
const commonLanguages = [
  { code: 'fr-FR', name: 'Français' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'es-ES', name: 'Español' },
  { code: 'ko-KR', name: '한국어' },
  { code: 'ru-RU', name: 'Русский' },
  { code: 'pt-BR', name: 'Português' },
  { code: 'it-IT', name: 'Italiano' }
]

const togglePopover = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      codeInput.value?.focus()
    })
  }
}

const closePopover = () => {
  isOpen.value = false
  languageCode.value = ''
  languageName.value = ''
  error.value = ''
}

const selectLanguage = (lang) => {
  languageCode.value = lang.code
  languageName.value = lang.name
  error.value = ''
}

const validateLanguageCode = (code) => {
  if (!code.trim()) {
    return 'Language code is required'
  }

  // 检查语言代码格式 (如 en-US, zh-CN)
  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(code)) {
    return 'Language code must be in format like "en-US" or "zh-CN"'
  }

  return null
}

const handleSubmit = () => {
  const validationError = validateLanguageCode(languageCode.value)
  if (validationError) {
    error.value = validationError
    return
  }

  // 发送添加语言事件
  emit('add-language', {
    code: languageCode.value.trim(),
    name: languageName.value.trim() || languageCode.value.trim()
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
