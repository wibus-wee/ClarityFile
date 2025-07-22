<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">Pinia Store 测试页面</h1>
    
    <!-- 设置测试 -->
    <div class="mb-8 p-4 border rounded">
      <h2 class="text-lg font-semibold mb-4">设置 Store 测试</h2>
      <div class="space-y-2">
        <p>当前主题: {{ settings.theme }}</p>
        <p>是否暗色模式: {{ settings.isDark }}</p>
        <p>自动保存: {{ settings.autoSave }}</p>
        <div class="space-x-2">
          <button @click="settings.toggleDark()" class="px-3 py-1 bg-blue-500 text-white rounded">
            切换主题
          </button>
          <button @click="settings.autoSave = !settings.autoSave" class="px-3 py-1 bg-green-500 text-white rounded">
            切换自动保存
          </button>
        </div>
      </div>
    </div>

    <!-- 翻译 Store 测试 -->
    <div class="mb-8 p-4 border rounded">
      <h2 class="text-lg font-semibold mb-4">翻译 Store 测试</h2>
      <div class="space-y-2">
        <p>当前语言: {{ translations.currentLanguage }}</p>
        <p>可用语言数量: {{ translations.availableLanguages.length }}</p>
        <p>当前命名空间: {{ translations.activeNamespace || '未选择' }}</p>
        <p>翻译条目数量: {{ translations.translationEntries.length }}</p>
        <p>是否有未保存更改: {{ translations.hasUnsavedChanges }}</p>
        <p>翻译进度: {{ translations.translationProgress }}%</p>
        <div class="space-x-2">
          <button @click="translations.selectLanguage('en-US')" class="px-3 py-1 bg-purple-500 text-white rounded">
            切换到英语
          </button>
          <button @click="translations.selectLanguage('zh-CN')" class="px-3 py-1 bg-purple-500 text-white rounded">
            切换到中文
          </button>
          <button @click="translations.toggleUntranslatedFilter()" class="px-3 py-1 bg-orange-500 text-white rounded">
            切换筛选: {{ translations.showOnlyUntranslated ? '显示全部' : '仅未翻译' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 文件系统 Store 测试 -->
    <div class="mb-8 p-4 border rounded">
      <h2 class="text-lg font-semibold mb-4">文件系统 Store 测试</h2>
      <div class="space-y-2">
        <p>Locales 路径: {{ fileSystem.localesPath || '未设置' }}</p>
        <p>命名空间数量: {{ fileSystem.namespaces.length }}</p>
        <p>是否加载中: {{ fileSystem.isLoading }}</p>
        <p>错误信息: {{ fileSystem.error || '无' }}</p>
        <div class="space-x-2">
          <button @click="fileSystem.loadNamespaces()" class="px-3 py-1 bg-red-500 text-white rounded">
            加载命名空间
          </button>
          <button @click="fileSystem.setLocalesPath('/test/path')" class="px-3 py-1 bg-red-500 text-white rounded">
            设置测试路径
          </button>
        </div>
      </div>
    </div>

    <!-- 批量操作测试 -->
    <div class="mb-8 p-4 border rounded">
      <h2 class="text-lg font-semibold mb-4">批量操作测试</h2>
      <div class="space-y-2">
        <p>修改的条目数量: {{ translations.modifiedEntries.length }}</p>
        <div class="space-x-2">
          <button @click="testBatchUpdate" class="px-3 py-1 bg-yellow-500 text-white rounded">
            测试批量更新
          </button>
          <button @click="testExportJson" class="px-3 py-1 bg-blue-500 text-white rounded">
            导出 JSON
          </button>
          <button @click="testExportCsv" class="px-3 py-1 bg-blue-500 text-white rounded">
            导出 CSV
          </button>
          <button @click="translations.cancelAutoSave()" class="px-3 py-1 bg-red-500 text-white rounded">
            取消自动保存
          </button>
        </div>
      </div>
    </div>

    <!-- 状态持久化测试 -->
    <div class="mb-8 p-4 border rounded">
      <h2 class="text-lg font-semibold mb-4">状态持久化测试</h2>
      <p class="text-sm text-gray-600 mb-2">刷新页面后，设置应该保持不变</p>
      <div class="space-x-2">
        <button @click="reloadPage" class="px-3 py-1 bg-gray-500 text-white rounded">
          刷新页面
        </button>
        <button @click="exportSettings" class="px-3 py-1 bg-indigo-500 text-white rounded">
          导出设置
        </button>
        <button @click="resetAllStores" class="px-3 py-1 bg-red-600 text-white rounded">
          重置所有状态
        </button>
      </div>
    </div>

    <!-- 返回链接 -->
    <div class="mt-8">
      <NuxtLink to="/" class="text-blue-500 hover:underline">← 返回首页</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useTranslationsNew } from '~/composables/useTranslationsNew'
import { useSettingsNew } from '~/composables/useSettingsNew'
import { useFileSystemNew } from '~/composables/useFileSystemNew'

// 设置页面标题
useHead({
  title: 'Pinia Store 测试 - ClarityFile Locales Editor'
})

// 使用新的 Pinia-based composables
const settings = useSettingsNew()
const translations = useTranslationsNew()
const fileSystem = useFileSystemNew()

// 测试方法
const reloadPage = () => {
  if (import.meta.client) {
    window.location.reload()
  }
}

const exportSettings = () => {
  const settingsJson = settings.exportSettings()
  console.log('导出的设置:', settingsJson)
  if (import.meta.client) {
    alert('设置已导出到控制台')
  }
}

// 新增的测试方法
const testBatchUpdate = async () => {
  const updates = [
    { path: 'test.key1', languageCode: 'en-US', value: 'Test Value 1' },
    { path: 'test.key2', languageCode: 'en-US', value: 'Test Value 2' }
  ]

  const result = await translations.batchUpdateTranslations(updates)
  console.log('批量更新结果:', result)
  if (import.meta.client) {
    alert(`批量更新完成: 成功 ${result.success}, 失败 ${result.failed}`)
  }
}

const testExportJson = () => {
  const jsonData = translations.exportTranslations('json')
  console.log('导出的 JSON 数据:', jsonData)
  if (import.meta.client) {
    alert('JSON 数据已导出到控制台')
  }
}

const testExportCsv = () => {
  const csvData = translations.exportTranslations('csv')
  console.log('导出的 CSV 数据:', csvData)
  if (import.meta.client) {
    alert('CSV 数据已导出到控制台')
  }
}

const resetAllStores = () => {
  translations.resetStore()
  settings.resetSettings()
  fileSystem.clearError()
  if (import.meta.client) {
    alert('所有状态已重置')
  }
}

// 页面加载时的初始化
onMounted(() => {
  console.log('Pinia stores 初始化完成')
  console.log('Settings store:', settings)
  console.log('Translations store:', translations)
  console.log('FileSystem store:', fileSystem)
})
</script>
