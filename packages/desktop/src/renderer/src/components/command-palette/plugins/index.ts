// 插件系统核心导出
export { PluginErrorBoundary, PluginWrapper } from './plugin-error-boundary'
export { PluginContextProviderComponent } from './plugin-context'
export {
  usePluginRegistryStore,
  usePluginRegistry,
  useRegisteredPlugins,
  usePluginRegistryIsInitialized,
  usePluginRegistryPluginCount,
  usePluginRegistryErrorCount,
  usePluginRegistryErrors,
  usePluginState
} from './plugin-registry'
