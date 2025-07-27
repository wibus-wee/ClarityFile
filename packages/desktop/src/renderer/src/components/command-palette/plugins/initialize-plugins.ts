import { usePluginRegistryStore } from './plugin-registry'
import { PluginInitializer } from './plugin-initializer'

// 防止重复初始化的标志
let isInitialized = false

/**
 * 初始化插件系统
 *
 * 这是一个纯函数，应该在应用启动时调用一次
 * 具有幂等性，多次调用不会重复初始化
 */
export function initializePlugins() {
  // 防止重复初始化
  if (isInitialized) {
    console.log('🔌 Plugin system already initialized, skipping...')
    return true
  }

  console.log('🔌 Initializing Command Palette plugins...')

  try {
    const pluginRegistry = usePluginRegistryStore.getState().actions

    // 获取所有有效插件
    const validPlugins = PluginInitializer.getValidPlugins()
    const stats = PluginInitializer.getPluginStats()

    console.log('📊 Plugin Statistics:', stats)

    if (stats.invalid > 0) {
      console.warn(
        `⚠️ Found ${stats.invalid} invalid plugins:`,
        stats.plugins.filter((p) => !p.isValid)
      )
    }

    // 批量注册有效插件
    if (validPlugins.length > 0) {
      pluginRegistry.registerPlugins(validPlugins)
      console.log(
        `✅ Successfully registered ${validPlugins.length} plugins:`,
        validPlugins.map((p) => p.name)
      )
    } else {
      console.warn('⚠️ No valid plugins found to register')
    }

    // 标记注册表为已初始化
    pluginRegistry.initialize()

    // 标记全局初始化完成
    isInitialized = true

    console.log('🎉 Plugin initialization completed!')
    return true
  } catch (error) {
    console.error('❌ Plugin initialization failed:', error)

    // 记录错误但不阻止应用启动
    const pluginRegistry = usePluginRegistryStore.getState().actions
    pluginRegistry.setPluginError(
      'initialization',
      error instanceof Error ? error.message : 'Unknown initialization error'
    )
    return false
  }
}
