import { ReactNode } from 'react'
import { ImportContext } from './import-hooks'
import type { ImportContextData } from './types'

/**
 * 导入上下文提供者
 */
export interface ImportContextProviderProps {
  children: ReactNode
  data: ImportContextData
}

export function ImportContextProvider({ children, data }: ImportContextProviderProps) {
  return <ImportContext.Provider value={data}>{children}</ImportContext.Provider>
}
