<template>
  <header class="h-12 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
    <div class="max-w-6xl mx-auto h-full px-4 flex-between">
      <!-- 左侧：Logo和标题 -->
      <div class="flex items-center gap-2">
        <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div class="i-carbon-translate text-base text-gray-400 opacity-60"></div>
          <h1 class="text-base font-light text-gray-900 dark:text-gray-100">
            Locales
          </h1>
        </NuxtLink>
      </div>

      <!-- 右侧：操作按钮 -->
      <div class="flex items-center gap-1">
        <!-- 语言选择器 -->
        <Popover ref="languageSelectorRef" position="bottom-right" @confirm="handleLanguageSelect">
          <template #trigger="{ toggle }">
            <button @click="toggle"
              class="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-200/10 rounded transition-all flex items-center gap-1.5">
              <span>{{ getCurrentLanguage.name }}</span>
              <div class="i-carbon-chevron-down text-xs opacity-60"></div>
            </button>
          </template>

          <template #content>
            <div class="py-1 min-w-32">
              <button v-for="lang in availableLanguages.filter(l => l.code !== currentLanguage)" :key="lang.code"
                @click="selectLanguage(lang.code)"
                class="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-200/10 transition-colors rounded-sm">
                {{ lang.name }}
              </button>
            </div>
          </template>
        </Popover>

        <!-- 主题切换按钮 -->
        <button @click="toggleDark"
          class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-200/10 rounded transition-all">
          <div class="i-carbon-moon dark:i-carbon-sun text-sm"></div>
        </button>

        <!-- 保存按钮（仅在编辑页面显示） -->
        <button v-if="showSaveButton" @click="saveAllChanges" :class="[
          'p-1.5 rounded transition-all',
          hasUnsavedChanges
            ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
        ]">
          <div class="i-carbon-save text-sm"></div>
        </button>

        <!-- 设置按钮 -->
        <NuxtLink to="/settings"
          class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-all">
          <div class="i-carbon-settings text-sm"></div>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useSettings } from '~/composables/useSettings'
import { useTranslations } from '~/composables/useTranslations'

// 设置和主题
const { toggleDark } = useSettings()

// 翻译相关（仅在编辑页面需要）
const route = useRoute()
const isEditingPage = computed(() => route.path.startsWith('/namespace/') || route.path === '/editor')

const {
  languages,
  currentLanguage,
  hasUnsavedChanges,
  saveAllChanges
} = useTranslations()

// 显示保存按钮的条件
const showSaveButton = computed(() => isEditingPage.value && hasUnsavedChanges.value)

// 语言选择器
const languageSelectorRef = ref()

// 可用语言列表
const availableLanguages = computed(() => languages.value || [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en-US', name: 'English' }
])

// 当前语言信息
const getCurrentLanguage = computed(() => {
  return availableLanguages.value.find(lang => lang.code === currentLanguage.value) ||
    availableLanguages.value[0]
})

// 选择语言
function selectLanguage(languageCode) {
  // TODO: 实现语言切换逻辑
  console.log('Select language:', languageCode)
  languageSelectorRef.value?.close()
}

// 处理语言选择确认
function handleLanguageSelect(languageCode) {
  selectLanguage(languageCode)
}
</script>
