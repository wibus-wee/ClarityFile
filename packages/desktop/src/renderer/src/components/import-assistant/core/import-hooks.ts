import { useContext } from 'react'
import { createContext } from 'react'
import type { ImportContextData, DroppedFileInfo } from './types'

/**
 * 导入上下文
 */
export const ImportContext = createContext<ImportContextData | null>(null)

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
