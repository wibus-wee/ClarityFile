/**
 * Pinia 客户端插件
 * 用于初始化 Pinia stores 和添加全局功能
 */

import { createStoreError } from '~/utils/storeHelpers'

export default defineNuxtPlugin(() => {
  const { $pinia } = useNuxtApp()

  // 添加全局错误处理插件
  $pinia.use(({ store, options }) => {
    // 为所有 store 添加错误处理
    store.$onAction(({ name, store, args, after, onError }) => {
      const startTime = Date.now()

      // 记录 action 开始
      if (process.dev) {
        console.log(`[Store Action] ${store.$id}.${name} started with args:`, args)
      }

      after((result) => {
        // 记录 action 完成
        if (process.dev) {
          const duration = Date.now() - startTime
          console.log(`[Store Action] ${store.$id}.${name} completed in ${duration}ms`)
        }
      })

      onError((error) => {
        // 统一错误处理
        const storeError = createStoreError(`${store.$id}.${name}`, `Action ${name} failed`, error)

        console.error(`[Store Error] ${store.$id}.${name}:`, storeError)

        // 可以在这里添加错误上报逻辑
        // reportError(storeError)
      })
    })

    // 为所有 store 添加状态变化监听
    store.$subscribe((mutation, state) => {
      if (process.dev) {
        console.log(`[Store Mutation] ${store.$id}:`, {
          type: mutation.type,
          storeId: mutation.storeId,
          payload: 'payload' in mutation ? mutation.payload : undefined
        })
      }
    })
  })

  // 初始化设置 store（确保在客户端初始化）
  const settingsStore = useSettingsStore()
  settingsStore.initializeSettings()

  // 初始化翻译 store 的自动保存
  const translationsStore = useTranslationsStore()
  translationsStore.initAutoSave()
})
