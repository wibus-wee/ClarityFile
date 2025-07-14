<template>
  <!-- 编辑器页面：左侧选择语言和命名空间，右侧显示翻译表格 -->
  <div class="flex h-full">
    <!-- 左侧：语言和命名空间选择 -->
    <aside class="w-64 border-r border-antfu-border flex flex-col">
      <!-- 返回首页和主题切换 -->
      <div class="p-4 border-b border-antfu-border">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2 text-antfu-text-soft hover:text-antfu-text transition-colors">
            <div class="i-carbon-arrow-left text-sm"></div>
            <span class="text-sm">Back to Home</span>
          </NuxtLink>

          <!-- 主题切换按钮 -->
          <button @click="toggleDark"
            class="p-1.5 text-antfu-text-soft hover:text-antfu-text hover:bg-antfu-bg-soft rounded transition-all"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
            <div :class="isDark ? 'i-carbon-sun' : 'i-carbon-moon'" class="text-sm"></div>
          </button>
        </div>
      </div>

      <!-- 语言选择 -->
      <div class="p-4 border-b border-antfu-border">
        <h3 class="text-sm font-medium text-antfu-text mb-3">
          Current Language
        </h3>
        <select v-model="currentLanguage"
          class="w-full px-3 py-2 text-sm border border-antfu-border bg-antfu-bg text-antfu-text rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
          <option v-for="lang in languages" :key="lang.code" :value="lang.code">
            {{ lang.name }} {{ lang.isBase ? '(Base)' : '' }}
          </option>
        </select>
      </div>

      <!-- 命名空间列表 -->
      <div class="flex-1 overflow-auto">
        <div class="p-4">
          <h3 class="text-sm font-medium text-antfu-text mb-3">
            Namespaces
          </h3>
          <div class="space-y-1">
            <button v-for="namespace in namespaces" :key="namespace.name" @click="selectNamespace(namespace.name)"
              :class="[
                'w-full text-left p-3 text-sm rounded transition-all',
                activeNamespace === namespace.name
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'text-antfu-text-soft hover:text-antfu-text hover:bg-antfu-bg-soft'
              ]">
              <div class="font-medium">{{ namespace.displayName }}</div>
              <div class="text-xs opacity-60 mt-1">
                {{ namespace.name }} • {{ namespace.keyCount }} keys
              </div>
              <div class="flex items-center gap-2 mt-2">
                <div class="flex-1 h-1 bg-antfu-bg-mute rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 transition-all duration-300"
                    :style="{ width: `${namespace.progress}%` }"></div>
                </div>
                <span class="text-xs opacity-60">{{ namespace.progress }}%</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧：翻译表格编辑器 -->
    <main class="flex-1 flex flex-col min-w-0">
      <!-- 编辑器头部 -->
      <div class="border-b border-antfu-border p-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-light text-antfu-text">
              {{ currentNamespace?.displayName || activeNamespace || 'Select a namespace' }}
            </h1>
            <div v-if="activeNamespace" class="flex items-center gap-4 mt-1">
              <p class="text-sm text-antfu-text-mute opacity-75">
                {{ translationEntries.length }} keys
              </p>
              <div v-if="translationProgress" class="flex items-center gap-2">
                <div class="w-16 h-1.5 bg-antfu-bg-mute rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 transition-all duration-300"
                    :style="{ width: `${translationProgress}%` }"></div>
                </div>
                <span class="text-xs text-antfu-text-mute">
                  {{ translationProgress }}%
                </span>
              </div>
              <div v-if="hasUnsavedChanges" class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                <span class="text-xs text-amber-600 dark:text-amber-400">
                  {{ modifiedEntries.length }} unsaved
                </span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div v-if="activeNamespace" class="flex items-center gap-3">
            <!-- 筛选按钮 -->
            <button @click="toggleUntranslatedFilter" :class="[
              'px-2 py-1 text-sm rounded transition-all flex items-center gap-1.5',
              showOnlyUntranslated
                ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                : 'text-antfu-text-soft hover:text-antfu-text hover:bg-antfu-bg-soft'
            ]">
              <div class="i-carbon-filter text-xs"></div>
              <span>{{ showOnlyUntranslated ? 'Show All' : 'Untranslated' }}</span>
              <span v-if="untranslatedCount > 0" class="text-xs opacity-60">({{ untranslatedCount }})</span>
            </button>

            <!-- 添加键按钮 -->
            <AddKeyPopover :namespace="activeNamespace" :base-language="currentLanguage" @add-key="handleAddKey" />

            <!-- 添加语言按钮 -->
            <AddLanguagePopover @add-language="handleAddLanguage" />
          </div>
        </div>
      </div>

      <!-- 翻译表格 -->
      <div class="flex-1 overflow-auto">
        <div v-if="activeNamespace">
          <EnhancedTranslationTable :namespace="activeNamespace" :languages="languages" />
        </div>
        <div v-else class="flex-center h-full text-antfu-text-mute">
          <div class="text-center">
            <div class="i-carbon-translate text-4xl mb-4 opacity-30 mx-auto"></div>
            <h3 class="text-base font-light mb-1">Choose a namespace</h3>
            <p class="text-sm opacity-60">Select a namespace from the sidebar to start editing translations</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useTranslations } from '~/composables/useTranslations'
import { useSettings } from '~/composables/useSettings'

// 设置页面标题
useHead({
  title: 'Editor - ClarityFile Locales Editor'
})

// 使用设置（主题切换）
const { isDark, toggleDark } = useSettings()

// 使用翻译数据
const {
  namespaces,
  languages,
  activeNamespace,
  currentLanguage,
  translationEntries,
  translationProgress,
  hasUnsavedChanges,
  modifiedEntries,
  showOnlyUntranslated,
  untranslatedCount,
  selectNamespace,
  toggleUntranslatedFilter,
  saveAllChanges,
  loadNamespaces,
  loadNamespaceTranslations
} = useTranslations()

// 当前命名空间信息
const currentNamespace = computed(() =>
  namespaces.value.find(ns => ns.name === activeNamespace.value)
)

// 处理添加新键
const handleAddKey = (data) => {
  console.log('Adding new key:', data)
  // TODO: 实现添加新键的逻辑
  // 调用 API 添加新键到当前命名空间
}

// 处理添加新语言
const handleAddLanguage = (data) => {
  console.log('Adding new language:', data)
  // TODO: 实现添加新语言的逻辑
  // 调用 API 为所有命名空间添加新语言文件
}

// 页面加载时获取数据
onMounted(async () => {
  await loadNamespaces()

  // 如果有预选的 namespace，加载其翻译数据
  if (activeNamespace.value) {
    await loadNamespaceTranslations(activeNamespace.value)
  }
})
</script>
