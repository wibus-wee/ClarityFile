import { PluginContextProvider } from './context'
import type { PluginContextProviderProps } from './types'

/**
 * 插件上下文提供者组件
 */
export function PluginContextProviderComponent({ children, context }: PluginContextProviderProps) {
  return <PluginContextProvider.Provider value={context}>{children}</PluginContextProvider.Provider>
}
