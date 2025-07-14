<template>
  <header
    class="h-14 border-b bg-antfu-bg text-antfu-text border-antfu-border backdrop-blur-sm transition-all duration-200">
    <div class="max-w-6xl mx-auto h-full px-4 flex-between">
      <!-- 左侧：Logo、标题和导航 -->
      <div class="flex items-center gap-6">
        <!-- Logo和标题 -->
        <NuxtLink to="/" class="flex items-center gap-2.5 hover:opacity-80 transition-opacity group">
          <div class="i-carbon-translate text-lg text-emerald-500 group-hover:text-emerald-600 transition-colors"></div>
          <div class="flex flex-col">
            <h1 class="text-base font-normal text-gray-900 dark:text-gray-100 leading-none">
              ClarityFile Locales
            </h1>
            <span class="text-xs text-gray-500 dark:text-gray-400 leading-none mt-1">
              Translation Editor
            </span>
          </div>
        </NuxtLink>
      </div>

      <!-- 右侧：状态信息和操作按钮 -->
      <div class="flex items-center gap-3">
        <!-- 翻译进度指示器（仅在编辑页面显示） -->
        <div v-if="isEditingPage && currentNamespaceInfo"
          class="flex items-center gap-2 px-2.5 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-md">
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full" :class="getProgressColor(currentNamespaceInfo.progress)"></div>
            <span class="text-xs text-gray-600 dark:text-gray-400">
              {{ currentNamespaceInfo.progress }}%
            </span>
          </div>
          <div class="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ currentNamespaceInfo.totalKeys }} keys
          </span>
        </div>

        <!-- 操作按钮组 -->
        <div class="flex items-center gap-1">
          <!-- 语言选择器 -->
          <Popover ref="languageSelectorRef" position="bottom-right" @confirm="handleLanguageSelect">
            <template #trigger="{ toggle }">
              <button @click="toggle"
                class="px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-md transition-all flex items-center gap-1.5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                <div class="i-carbon-language text-xs"></div>
                <span>{{ getCurrentLanguage.name }}</span>
                <div class="i-carbon-chevron-down text-xs opacity-60"></div>
              </button>
            </template>

            <template #content>
              <div class="py-1 min-w-36">
                <button v-for="lang in availableLanguages.filter(l => l.code !== currentLanguage)" :key="lang.code"
                  @click="selectLanguage(lang.code)"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors rounded-sm flex items-center gap-2">
                  <div class="i-carbon-language text-xs opacity-60"></div>
                  {{ lang.name }}
                </button>
              </div>
            </template>
          </Popover>

          <!-- 主题切换按钮 -->
          <button @click="toggleDark"
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-md transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
            <div class="i-carbon-moon dark:i-carbon-sun text-sm"></div>
          </button>

          <!-- 保存按钮（仅在编辑页面显示） -->
          <button v-if="showSaveButton" @click="saveAllChanges"
            :title="hasUnsavedChanges ? 'Save changes' : 'No changes to save'" :class="[
              'p-2 rounded-md transition-all border',
              hasUnsavedChanges
                ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
            ]">
            <div class="i-carbon-save text-sm"></div>
          </button>

          <!-- 设置按钮 -->
          <NuxtLink to="/settings"
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-md transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            title="Settings">
            <div class="i-carbon-settings text-sm"></div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useSettings } from '~/composables/useSettings'
import { useTranslations } from '~/composables/useTranslations'

// 设置和主题
const { toggleDark, isDark } = useSettings()

// 翻译相关（仅在编辑页面需要）
const route = useRoute()
const isEditingPage = computed(() => route.path === '/editor')

const {
  languages,
  currentLanguage,
  hasUnsavedChanges,
  saveAllChanges,
  activeNamespace,
  namespaces
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

// 当前命名空间信息
const currentNamespaceInfo = computed(() => {
  if (!activeNamespace.value || !namespaces.value) return null

  const namespace = namespaces.value.find(ns => ns.name === activeNamespace.value)
  if (!namespace) return null

  return {
    name: namespace.name,
    displayName: namespace.displayName,
    totalKeys: namespace.keyCount || 0,
    progress: namespace.progress || 0
  }
})

// 面包屑导航
const breadcrumbs = computed(() => {
  const crumbs = []

  if (route.path === '/editor') {
    crumbs.push({ label: 'Editor', to: '/editor' })

    if (currentNamespaceInfo.value) {
      crumbs.push({
        label: currentNamespaceInfo.value.displayName || currentNamespaceInfo.value.name
      })
    }
  } else if (route.path === '/settings') {
    crumbs.push({ label: 'Settings' })
  }

  return crumbs
})

// 进度颜色
function getProgressColor(progress) {
  if (progress >= 95) return 'bg-emerald-500'
  if (progress >= 80) return 'bg-blue-500'
  if (progress >= 60) return 'bg-yellow-500'
  if (progress >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

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
