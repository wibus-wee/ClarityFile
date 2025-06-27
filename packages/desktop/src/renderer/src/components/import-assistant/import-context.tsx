import { createContext, useContext, ReactNode } from 'react'
import type { DroppedFileInfo } from './types'

/**
 * 导入上下文数据
 */
export interface ImportContextData {
  /** 拖拽的文件列表 */
  files: DroppedFileInfo[]
  /** 选择的项目ID */
  projectId: string
  /** 导入类型 */
  importType: 'expense' | 'document'
  /** 预填充数据 */
  prefilledData?: {
    // 发票报销预填充
    expense?: {
      itemName?: string
      applicant?: string
      amount?: number
      notes?: string
    }
    // 文档预填充
    document?: {
      name?: string
      type?: string
      description?: string
    }
    // 文档版本预填充
    documentVersion?: {
      versionTag?: string
      notes?: string
      isGenericVersion?: boolean
    }
  }
}

/**
 * 导入上下文
 */
const ImportContext = createContext<ImportContextData | null>(null)

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

/**
 * 使用导入上下文
 */
export function useImportContext(): ImportContextData {
  const context = useContext(ImportContext)
  if (!context) {
    throw new Error('useImportContext must be used within ImportContextProvider')
  }
  return context
}

/**
 * 从导入上下文获取预选择的文件
 */
export function usePreselectedFile(): DroppedFileInfo | null {
  const { files } = useImportContext()
  return files.length > 0 ? files[0] : null
}

/**
 * 从导入上下文获取发票报销预填充数据
 */
export function useExpensePrefilledData() {
  const { prefilledData } = useImportContext()
  return prefilledData?.expense
}

/**
 * 从导入上下文获取文档预填充数据
 */
export function useDocumentPrefilledData() {
  const { prefilledData } = useImportContext()
  return prefilledData?.document
}

/**
 * 从导入上下文获取文档版本预填充数据
 */
export function useDocumentVersionPrefilledData() {
  const { prefilledData } = useImportContext()
  return prefilledData?.documentVersion
}
