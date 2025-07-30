import { createContext } from 'react'
import type { PluginContext } from './types'

/**
 * 插件上下文 Context
 */
export const PluginContextProvider = createContext<PluginContext | null>(null)
