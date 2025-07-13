<template>
  <div class="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
    <!-- 顶部导航栏 - 完全antfu风格 -->
    <header class="h-12 border-b border-gray-100 dark:border-gray-800">
      <div class="max-w-6xl mx-auto h-full px-4 flex-between">
        <div class="flex items-center gap-2">
          <div class="i-carbon-translate text-base text-gray-400 opacity-60"></div>
          <h1 class="text-base font-light text-gray-900 dark:text-gray-100">
            Locales
          </h1>
        </div>

        <div class="flex items-center gap-1">
          <button @click="toggleDarkMode"
            class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-all">
            <div class="i-carbon-moon dark:i-carbon-sun text-sm"></div>
          </button>
          <button
            class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-all">
            <div class="i-carbon-save text-sm"></div>
          </button>
          <button
            class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-all">
            <div class="i-carbon-settings text-sm"></div>
          </button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 - antfu风格布局 -->
    <div class="max-w-6xl mx-auto flex h-[calc(100vh-3rem)]">
      <!-- 左侧：命名空间导航 -->
      <aside class="w-56 border-r border-gray-100 dark:border-gray-800">
        <div class="p-4">
          <h2 class="text-sm font-light text-gray-500 dark:text-gray-400 mb-3 opacity-75">
            Namespaces
          </h2>
          <div class="space-y-1">
            <NamespaceItem v-for="namespace in namespaces" :key="namespace.name" :namespace="namespace"
              :active="activeNamespace === namespace.name" @select="selectNamespace" />
          </div>
        </div>
      </aside>

      <!-- 右侧：键值对表格编辑器 -->
      <main class="flex-1 flex flex-col">
        <div class="border-b border-gray-100 dark:border-gray-800 p-4">
          <div class="flex-between">
            <div>
              <h2 class="text-lg font-light text-gray-900 dark:text-gray-100">
                {{ activeNamespace || 'Select a namespace' }}
              </h2>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-0.5 opacity-75">
                Translation keys and values
              </p>
            </div>
            <div class="flex items-center gap-3">
              <button
                class="px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-all flex items-center gap-1.5">
                <div class="i-carbon-add text-xs"></div>
                Add Key
              </button>
              <button
                class="px-2 py-1 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-all flex items-center gap-1.5">
                <div class="i-carbon-language text-xs"></div>
                Add Language
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-auto">
          <TranslationTable v-if="activeNamespace" :namespace="activeNamespace" :languages="languages" />
          <div v-else class="flex-center h-full text-gray-400 dark:text-gray-500">
            <div class="text-center">
              <div class="i-carbon-translate text-4xl mb-4 opacity-30"></div>
              <h3 class="text-base font-light mb-1">Choose a namespace</h3>
              <p class="text-sm opacity-60">Select a namespace from the sidebar to start editing translations</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
// 模拟数据
const namespaces = ref([
  { name: 'common', label: '通用', count: 25 },
  { name: 'navigation', label: '导航', count: 15 },
  { name: 'files', label: '文件管理', count: 48 },
  { name: 'settings', label: '设置', count: 32 },
  { name: 'dashboard', label: '仪表板', count: 18 },
])

const languages = ref([
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en-US', name: 'English' },
])

const activeNamespace = ref('files')

function selectNamespace(namespace) {
  activeNamespace.value = namespace
}

function toggleDarkMode() {
  const html = document.documentElement
  if (html.classList.contains('dark')) {
    html.classList.remove('dark')
  } else {
    html.classList.add('dark')
  }
}
</script>
