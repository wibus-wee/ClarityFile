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
          <!-- 语言选择器 -->
          <div class="relative language-selector">
            <button @click="showLanguageSelector = !showLanguageSelector"
              class="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-200/10 rounded transition-all flex items-center gap-1.5">
              <span>{{ getCurrentLanguage.name }}</span>
              <div class="i-carbon-chevron-down text-xs opacity-60"></div>
            </button>

            <!-- 语言选择下拉菜单 -->
            <div v-if="showLanguageSelector"
              class="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-hex-121212 border border-gray-200/20 dark:border-gray-200/20 rounded z-50">
              <div class="py-1">
                <button v-for="lang in availableLanguages.filter(l => l.code !== currentLanguage)" :key="lang.code"
                  @click="selectLanguage(lang.code)" :class="[
                    'w-full text-left px-3 py-1.5 text-sm transition-colors',
                    currentLanguage === lang.code
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-200/10'
                  ]">
                  {{ lang.name }}
                </button>
              </div>
            </div>
          </div>

          <button @click="toggleDarkMode"
            class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-200/10 rounded transition-all">
            <div class="i-carbon-moon dark:i-carbon-sun text-sm"></div>
          </button>
          <button @click="saveAllChanges" :class="[
            'p-1.5 rounded transition-all',
            hasUnsavedChanges
              ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
          ]">
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
      <main class="flex-1 flex flex-col min-w-0">
        <div class="border-b border-gray-100 dark:border-gray-800 p-4">
          <div class="flex-between">
            <div>
              <h2 class="text-lg font-light text-gray-900 dark:text-gray-100">
                {{ activeNamespace || 'Select a namespace' }}
              </h2>
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
            <div class="flex items-center gap-3">
              <button @click="addNewKey"
                class="px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-all flex items-center gap-1.5">
                <div class="i-carbon-add text-xs"></div>
                Add Key
              </button>
              <button @click="addNewLanguage"
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

    <!-- Dialog 组件 -->
    <Dialog :is-open="dialog.isOpen.value" :title="dialog.dialogOptions.value.title"
      :message="dialog.dialogOptions.value.message" :type="dialog.dialogOptions.value.type"
      :placeholder="dialog.dialogOptions.value.placeholder" :confirm-text="dialog.dialogOptions.value.confirmText"
      :cancel-text="dialog.dialogOptions.value.cancelText" @confirm="dialog.handleConfirm"
      @cancel="dialog.handleCancel" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 使用 composables
const fileSystem = useFileSystem()
const translations = useTranslations()

// 从 composables 获取状态
const { namespaces } = fileSystem
const { activeNamespace, languages, currentLanguage, availableLanguages, getCurrentLanguage, hasUnsavedChanges, translationEntries, translationProgress, modifiedEntries, dialog } = translations

// 语言选择器状态
const showLanguageSelector = ref(false)

// 初始化：设置默认的 locales 路径
onMounted(() => {
  // 在实际应用中，这个路径应该从配置或用户选择中获取
  fileSystem.setLocalesPath('./locales')

  // 默认选择第一个命名空间
  if (namespaces.value.length > 0) {
    translations.selectNamespace('files')
  }
})

// 选择命名空间
function selectNamespace(namespace) {
  translations.selectNamespace(namespace)
}

// 切换深色模式
function toggleDarkMode() {
  const html = document.documentElement
  if (html.classList.contains('dark')) {
    html.classList.remove('dark')
  } else {
    html.classList.add('dark')
  }
}

// 保存所有修改
async function saveAllChanges() {
  const success = await translations.saveAllChanges()
  if (success) {
    console.log('所有修改已保存')
  } else {
    console.error('保存失败')
  }
}

// 添加新键
async function addNewKey() {
  try {
    const keyPath = await dialog.prompt('请输入新键的路径 (例如: actions.newAction):', '', '添加新键')
    if (keyPath && keyPath.trim()) {
      await translations.addTranslationKey(keyPath.trim())
    }
  } catch (error) {
    // 用户取消了操作
  }
}

// 语言选择功能
function selectLanguage(languageCode) {
  translations.selectLanguage(languageCode)
  showLanguageSelector.value = false // 选择后关闭下拉菜单
}

// 点击外部关闭语言选择器
function handleClickOutside(event) {
  if (!event.target.closest('.language-selector')) {
    showLanguageSelector.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 添加新语言
async function addNewLanguage() {
  try {
    const code = await dialog.prompt('请输入语言代码 (例如: fr-FR):', '', '添加新语言')
    if (!code || !code.trim()) return

    const name = await dialog.prompt('请输入语言名称 (例如: Français):', '', '添加新语言')
    if (!name || !name.trim()) return

    await translations.addLanguage(code.trim(), name.trim())
  } catch (error) {
    // 用户取消了操作
  }
}
</script>
