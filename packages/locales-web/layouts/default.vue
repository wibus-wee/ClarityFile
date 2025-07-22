<template>
  <div class="min-h-screen bg-white dark:bg-hex-121212 text-gray-900 dark:text-gray-100 transition-colors duration-200">
    <!-- 顶部导航栏 -->
    <AppHeader />

    <!-- 主要内容区域 -->
    <main class="max-w-6xl mx-auto h-[calc(100vh-3rem)]">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useSettingsNew } from '~/composables/useSettingsNew'

// 初始化设置
const { isDark } = useSettingsNew()

// 监听深色模式变化并应用到HTML元素
watch(isDark, (dark) => {
  if (import.meta.client) {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    document.documentElement.style.setProperty('color-scheme', dark ? 'dark' : 'light')
  }
}, { immediate: true })

// 设置全局样式
onMounted(() => {
  // 初始化时设置dark类
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  // 设置颜色方案
  document.documentElement.style.setProperty('color-scheme', isDark.value ? 'dark' : 'light')
})
</script>
