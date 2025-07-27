// 插件系统核心导出
export {
  PluginErrorBoundary,
  withPluginErrorBoundary,
  PluginWrapper
} from './plugin-error-boundary'
export {
  PluginContextProvider,
  usePluginContext,
  createPluginContext,
  PluginContextProviderComponent
} from './plugin-context'
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

// 类型导出
export type { PluginContext, PluginContextProviderProps } from './plugin-context'
