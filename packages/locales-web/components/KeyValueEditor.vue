<template>
  <div class="p-6 space-y-8">
    <!-- 键信息 - antfu风格 -->
    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div class="flex-between mb-4">
        <h3 class="text-lg font-light text-gray-900 dark:text-gray-100">Key Information</h3>
        <button
          class="text-sm text-gray-500 hover:text-emerald-500 transition-colors duration-200 flex items-center gap-2">
          <div class="i-carbon-edit"></div>
          Edit Key
        </button>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="space-y-1">
          <span class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Namespace</span>
          <div class="text-gray-900 dark:text-gray-100 font-medium">{{ namespace }}</div>
        </div>
        <div class="space-y-1">
          <span class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Key Path</span>
          <div
            class="text-gray-900 dark:text-gray-100 font-mono text-sm bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
            {{ keyPath }}</div>
        </div>
      </div>
    </div>

    <!-- 多语言编辑 - antfu风格 -->
    <div class="space-y-6">
      <h3 class="text-lg font-light text-gray-900 dark:text-gray-100">Translations</h3>

      <div v-for="language in languages" :key="language.code"
        class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div class="flex-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full"
                :class="getTranslationStatus(language.code) === 'translated' ? 'bg-emerald-500' : 'bg-amber-500'"></div>
              <div>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ language.name }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 font-mono ml-2">
                  {{ language.code }}
                </span>
              </div>
            </div>

            <span class="text-xs px-3 py-1.5 rounded-full font-medium" :class="getTranslationStatus(language.code) === 'translated'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'">
              {{ getTranslationStatus(language.code) === 'translated' ? 'Translated' : 'Pending' }}
            </span>
          </div>
        </div>

        <div class="space-y-2">
          <textarea v-model="translations[language.code]" :placeholder="`输入 ${language.name} 翻译...`"
            class="input-base input-dark w-full min-h-20 resize-y"
            @input="handleTranslationChange(language.code, $event.target.value)"></textarea>

          <!-- 字符统计 -->
          <div class="flex-between text-xs text-gray-500 dark:text-gray-400">
            <span>{{ getCharCount(language.code) }} 字符</span>
            <span v-if="hasChanges[language.code]" class="text-orange-600 dark:text-orange-400">
              未保存
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button class="btn-primary" :disabled="!hasAnyChanges" @click="saveChanges">
        <div class="i-carbon-save mr-2"></div>
        保存更改
      </button>

      <button class="btn-secondary" :disabled="!hasAnyChanges" @click="resetChanges">
        重置
      </button>

      <button class="btn-ghost">
        <div class="i-carbon-translate mr-2"></div>
        自动翻译
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  namespace: {
    type: String,
    required: true
  },
  keyPath: {
    type: String,
    required: true
  },
  languages: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['save'])

// 翻译数据
const translations = ref({})
const originalTranslations = ref({})
const hasChanges = ref({})

// 初始化翻译数据（模拟）
onMounted(() => {
  // 这里将来会从API获取真实数据
  const mockData = {
    'zh-CN': '文件管理',
    'en-US': 'File Management'
  }

  translations.value = { ...mockData }
  originalTranslations.value = { ...mockData }

  // 初始化变更状态
  props.languages.forEach(lang => {
    hasChanges.value[lang.code] = false
  })
})

// 计算属性
const hasAnyChanges = computed(() => {
  return Object.values(hasChanges.value).some(changed => changed)
})

// 方法
function getTranslationStatus(langCode) {
  return translations.value[langCode] && translations.value[langCode].trim()
    ? 'translated'
    : 'missing'
}

function getCharCount(langCode) {
  return translations.value[langCode]?.length || 0
}

function handleTranslationChange(langCode, value) {
  translations.value[langCode] = value
  hasChanges.value[langCode] = value !== originalTranslations.value[langCode]
}

function saveChanges() {
  const changedTranslations = {}

  Object.keys(hasChanges.value).forEach(langCode => {
    if (hasChanges.value[langCode]) {
      changedTranslations[langCode] = translations.value[langCode]
    }
  })

  emit('save', {
    namespace: props.namespace,
    keyPath: props.keyPath,
    translations: changedTranslations
  })

  // 更新原始数据
  originalTranslations.value = { ...translations.value }
  Object.keys(hasChanges.value).forEach(langCode => {
    hasChanges.value[langCode] = false
  })
}

function resetChanges() {
  translations.value = { ...originalTranslations.value }
  Object.keys(hasChanges.value).forEach(langCode => {
    hasChanges.value[langCode] = false
  })
}
</script>
