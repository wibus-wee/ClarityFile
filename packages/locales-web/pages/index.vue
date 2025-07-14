<template>
  <div class="min-h-screen">
    <div class="max-w-4xl mx-auto px-6 py-16">
      <!-- 标题区域 -->
      <div class="mb-16">
        <h1 class="text-3xl font-light text-gray-900 dark:text-gray-100 mb-3">
          ClarityFile Locales Editor
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-2xl">
          一个强大且直观的翻译管理工具，助力 ClarityFile 应用程序本地化。
          轻松编辑翻译内容，灵活管理多种语言，让本地化流程井然有序。
        </p>

        <p class="text-gray-500 dark:text-gray-400 text-xs leading-relaxed max-w-2xl mt-4 italic">
          Created by @wibus-wee. Making with ❤️.
        </p>
      </div>

      <!-- 统计信息 -->
      <div v-if="namespaces && namespaces.length > 0" class="mb-12">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-4 opacity-75">
          Project Overview
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div class="text-2xl font-light text-gray-900 dark:text-gray-100 mb-1">{{ namespaces.length }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Namespaces</div>
          </div>
          <div>
            <div class="text-2xl font-light text-gray-900 dark:text-gray-100 mb-1">{{ totalKeys }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Translation Keys</div>
          </div>
          <div>
            <div class="text-2xl font-light text-gray-900 dark:text-gray-100 mb-1">{{ languages.length || 2 }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Languages</div>
          </div>
          <div>
            <div class="text-2xl font-light text-emerald-600 dark:text-emerald-400 mb-1">{{ averageProgress }}%</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Avg Progress</div>
          </div>
        </div>
      </div>

      <!-- 命名空间列表 -->
      <div v-if="namespaces && namespaces.length > 0" class="mb-12">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-4 opacity-75">
          Available Namespaces
        </div>
        <div class="space-y-2">
          <button v-for="namespace in namespaces" :key="namespace.name" @click="navigateToNamespace(namespace.name)"
            class="group flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors rounded w-full text-left">
            <div class="flex items-center gap-3">
              <div class="text-sm font-mono text-gray-600 dark:text-gray-400 opacity-60">
                {{ namespace.name }}
              </div>
              <div class="text-sm text-gray-900 dark:text-gray-100">
                {{ namespace.displayName }}
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ namespace.keyCount }} keys
              </div>
              <div class="flex items-center gap-2">
                <div class="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 transition-all duration-300"
                    :style="{ width: `${namespace.progress}%` }"></div>
                </div>
                <div class="text-xs text-gray-400 dark:text-gray-500 min-w-8">
                  {{ namespace.progress }}%
                </div>
              </div>
              <div class="i-carbon-arrow-right text-gray-400 group-hover:text-emerald-500 transition-colors text-sm">
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- 操作区域 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/editor"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-600 rounded transition-all">
            <div class="i-carbon-arrow-right text-sm"></div>
            Get Started
          </NuxtLink>

          <NuxtLink to="/settings"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded transition-all">
            <div class="i-carbon-settings text-sm"></div>
            Settings
          </NuxtLink>

          <button @click="refreshNamespaces"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded transition-all">
            <div class="i-carbon-update-now text-sm"></div>
            Refresh
          </button>
        </div>

        <!-- 主题切换按钮 -->
        <button @click="toggleDark"
          class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
          <div :class="isDark ? 'i-carbon-sun' : 'i-carbon-moon'" class="text-lg"></div>
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="!namespaces || namespaces.length === 0" class="text-center py-16">
        <div class="text-gray-400 dark:text-gray-500 mb-4">
          <div class="i-carbon-folder-off text-4xl mb-3 mx-auto opacity-50"></div>
          <p class="text-sm">No translation files found</p>
          <p class="text-xs mt-1 opacity-75">Make sure your locales directory contains valid JSON files</p>
        </div>
        <button @click="refreshNamespaces"
          class="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-600 rounded transition-all">
          <div class="i-carbon-update-now text-sm"></div>
          Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTranslations } from '~/composables/useTranslations'
import { useSettings } from '~/composables/useSettings'

// 设置页面标题
useHead({
  title: 'ClarityFile Locales Editor'
})

// 使用设置（主题切换）
const { isDark, toggleDark } = useSettings()

// 使用翻译数据
const { namespaces, languages, loadNamespaces, selectNamespace } = useTranslations()

// 计算统计信息
const totalKeys = computed(() => {
  if (!namespaces.value) return 0
  return namespaces.value.reduce((sum, ns) => sum + ns.keyCount, 0)
})

const averageProgress = computed(() => {
  if (!namespaces.value || namespaces.value.length === 0) return 0
  const total = namespaces.value.reduce((sum, ns) => sum + ns.progress, 0)
  return Math.round(total / namespaces.value.length)
})

// 刷新命名空间
async function refreshNamespaces() {
  await loadNamespaces()
}

// 导航到指定命名空间
async function navigateToNamespace(namespaceName) {
  await selectNamespace(namespaceName)
  await navigateTo('/editor')
}

// 页面加载时获取数据
onMounted(() => {
  loadNamespaces()
})
</script>
