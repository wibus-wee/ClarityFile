<template>
  <div class="h-full flex flex-col">
    <!-- 页面头部 -->
    <div class="border-b border-gray-100 dark:border-gray-800 p-4">
      <div class="flex items-center gap-3">
        <NuxtLink 
          to="/"
          class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-all"
        >
          <div class="i-carbon-arrow-left text-sm"></div>
        </NuxtLink>
        <div>
          <h1 class="text-lg font-light text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p class="text-sm text-gray-400 dark:text-gray-500 opacity-75">
            Configure your locales editor preferences
          </p>
        </div>
      </div>
    </div>

    <!-- 设置内容 -->
    <div class="flex-1 overflow-auto p-6">
      <div class="max-w-2xl mx-auto space-y-8">
        
        <!-- 外观设置 -->
        <section>
          <h2 class="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
            Appearance
          </h2>
          <div class="space-y-4">
            <!-- 主题设置 -->
            <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Theme
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose your preferred color scheme
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  v-for="option in themeOptions" 
                  :key="option.value"
                  @click="setTheme(option.value)"
                  :class="[
                    'px-3 py-1.5 text-xs rounded transition-all flex items-center gap-1.5',
                    theme === option.value
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  ]"
                >
                  <div :class="option.icon"></div>
                  {{ option.label }}
                </button>
              </div>
            </div>

            <!-- 语言设置 -->
            <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Interface Language
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Language for the editor interface
                </p>
              </div>
              <select 
                v-model="interfaceLanguage"
                class="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="en">English</option>
                <option value="zh-CN">简体中文</option>
              </select>
            </div>
          </div>
        </section>

        <!-- 编辑器设置 -->
        <section>
          <h2 class="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
            Editor
          </h2>
          <div class="space-y-4">
            <!-- 自动保存 -->
            <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Auto Save
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Automatically save changes as you type
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  v-model="autoSave" 
                  type="checkbox" 
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <!-- 显示键路径 -->
            <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Show Key Paths
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Display full key paths in the editor
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  v-model="showKeyPaths" 
                  type="checkbox" 
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </section>

        <!-- 文件设置 -->
        <section>
          <h2 class="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
            Files
          </h2>
          <div class="space-y-4">
            <!-- 基准语言 -->
            <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Base Language
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  The reference language for translations
                </p>
              </div>
              <select 
                v-model="baseLanguage"
                class="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="zh-CN">简体中文 (zh-CN)</option>
                <option value="en-US">English (en-US)</option>
              </select>
            </div>

            <!-- 文件格式 -->
            <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  File Format
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  JSON formatting options
                </p>
              </div>
              <div class="flex items-center gap-2">
                <label class="flex items-center gap-2 text-sm">
                  <input 
                    v-model="prettyPrint" 
                    type="checkbox"
                    class="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  >
                  <span class="text-gray-700 dark:text-gray-300">Pretty print</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        <!-- 重置设置 -->
        <section>
          <div class="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-900/10">
            <h3 class="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
              Reset Settings
            </h3>
            <p class="text-sm text-red-700 dark:text-red-300 mb-3">
              This will reset all settings to their default values.
            </p>
            <button 
              @click="resetSettings"
              class="px-3 py-1.5 text-sm text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-700 rounded transition-all"
            >
              Reset to Defaults
            </button>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useSettings } from '~/composables/useSettings'

// 设置页面标题
useHead({
  title: 'Settings - ClarityFile Locales Editor'
})

// 使用设置
const {
  theme,
  interfaceLanguage,
  autoSave,
  showKeyPaths,
  baseLanguage,
  prettyPrint,
  setTheme,
  resetSettings
} = useSettings()

// 主题选项
const themeOptions = [
  { value: 'light', label: 'Light', icon: 'i-carbon-sun' },
  { value: 'dark', label: 'Dark', icon: 'i-carbon-moon' },
  { value: 'auto', label: 'Auto', icon: 'i-carbon-laptop' }
]
</script>
