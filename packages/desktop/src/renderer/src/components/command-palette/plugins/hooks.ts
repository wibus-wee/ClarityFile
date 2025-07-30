import { useContext } from 'react'
import { PluginContextProvider } from './context'
import type { PluginContext } from './types'

/**
 * 使用插件上下文的 Hook
 */
export function usePluginContext(): PluginContext {
  const context = useContext(PluginContextProvider)
  if (!context) {
    throw new Error('usePluginContext must be used within a PluginContextProvider')
  }
  return context
}
