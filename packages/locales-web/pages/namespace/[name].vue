<template>
  <!-- 保持左右布局 - 左侧命名空间导航，右侧编辑器 -->
  <div class="flex h-full">
    <!-- 左侧：命名空间导航 -->
    <aside class="w-56 border-r border-gray-100 dark:border-gray-800">
      <div class="p-4">
        <div class="flex items-center gap-2 mb-4">
          <NuxtLink to="/"
            class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-all">
            <div class="i-carbon-arrow-left text-sm"></div>
          </NuxtLink>
          <h2 class="text-sm font-light text-gray-500 dark:text-gray-400 opacity-75">
            Namespaces
          </h2>
        </div>
        <div class="space-y-1">
          <NuxtLink v-for="namespace in namespaces" :key="namespace.name" :to="`/namespace/${namespace.name}`" :class="[
            'block p-2 text-sm rounded transition-all',
            namespaceName === namespace.name
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900'
          ]">
            <div class="font-medium">{{ namespace.displayName }}</div>
            <div class="text-xs opacity-60">{{ namespace.name }} • {{ namespace.keyCount }} keys</div>
          </NuxtLink>
        </div>
      </div>
    </aside>

    <!-- 右侧：编辑器 -->
    <main class="flex-1 flex flex-col min-w-0">
      <!-- 编辑器头部 -->
      <div class="border-b border-gray-100 dark:border-gray-800 p-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-light text-gray-900 dark:text-gray-100">
              {{ currentNamespace?.displayName || namespaceName }}
            </h1>
            <div class="flex items-center gap-4 mt-1">
              <p class="text-sm text-gray-400 dark:text-gray-500 opacity-75">
                {{ translationEntries.length }} keys
              </p>
              <div v-if="translationProgress" class="flex items-center gap-2">
                <div class="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 transition-all duration-300"
                    :style="{ width: `${translationProgress}%` }"></div>
                </div>
                <span class="text-xs text-gray-400 dark:text-gray-500">
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
          <div class="flex items-center gap-3">
            <!-- 筛选按钮 -->
            <button @click="toggleUntranslatedFilter" :class="[
              'px-2 py-1 text-sm rounded transition-all flex items-center gap-1.5',
              showOnlyUntranslated
                ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900'
            ]">
              <div class="i-carbon-filter text-xs"></div>
              <span>{{ showOnlyUntranslated ? 'Show All' : 'Untranslated' }}</span>
              <span v-if="untranslatedCount > 0" class="text-xs opacity-60">({{ untranslatedCount }})</span>
            </button>

            <!-- 添加键按钮 -->
            <button
              class="px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-all flex items-center gap-1.5">
              <div class="i-carbon-add text-xs"></div>
              Add Key
            </button>

            <!-- 添加语言按钮 -->
            <button
              class="px-2 py-1 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-all flex items-center gap-1.5">
              <div class="i-carbon-language text-xs"></div>
              Add Language
            </button>
          </div>
        </div>
      </div>

      <!-- 翻译表格 -->
      <div class="flex-1 overflow-auto">
        <EnhancedTranslationTable v-if="namespaceName" :namespace="namespaceName" :languages="languages" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useTranslations } from '~/composables/useTranslations'

// 获取路由参数
const route = useRoute()
const namespaceName = computed(() => route.params.name)

// 设置页面标题
useHead({
  title: computed(() => `${namespaceName.value} - ClarityFile Locales Editor`)
})

// 使用翻译数据
const {
  namespaces,
  languages,
  translationEntries,
  translationProgress,
  hasUnsavedChanges,
  modifiedEntries,
  showOnlyUntranslated,
  untranslatedCount,
  selectNamespace,
  toggleUntranslatedFilter,
  saveAllChanges
} = useTranslations()

// 当前命名空间信息
const currentNamespace = computed(() =>
  namespaces.value.find(ns => ns.name === namespaceName.value)
)

// 监听路由变化，选择对应的命名空间
watch(namespaceName, (newName) => {
  if (newName) {
    selectNamespace(newName)
  }
}, { immediate: true })
</script>
