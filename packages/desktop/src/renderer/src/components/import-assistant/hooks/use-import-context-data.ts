import { useMemo } from 'react'
import { useExpenseImportHandler, ExpenseImportUtils } from './use-expense-import'
import { useDocumentImportHandler, DocumentImportUtils } from './use-document-import'
import type { DroppedFileInfo, ImportContextData } from '../core/types'

/**
 * 创建导入上下文数据的自定义Hook
 * 处理文件解析和预填充数据的生成
 */
export function useImportContextData(
  files: DroppedFileInfo[],
  projectId: string
): ImportContextData {
  const { handleImport: handleExpenseImport } = useExpenseImportHandler()
  const { handleImport: handleDocumentImport } = useDocumentImportHandler()

  return useMemo(() => {
    if (files.length === 0) {
      return {
        files: [],
        projectId,
        importType: 'document', // 默认类型
        prefilledData: undefined
      }
    }

    const file = files[0]

    // 为发票报销预填充数据
    const expensePrefilledData = {
      itemName: ExpenseImportUtils.inferExpenseItemFromFile(file),
      amount: ExpenseImportUtils.inferAmountFromFile(file) || undefined,
      notes: `导入文件：${file.name}`
    }

    // 为文档导入预填充数据
    const documentPrefilledData = {
      name: DocumentImportUtils.inferDocumentNameFromFile(file),
      type: DocumentImportUtils.inferDocumentTypeFromFile(file),
      description: `从文件 ${file.name} 导入`
    }

    return {
      files,
      projectId,
      importType: 'document', // 默认类型，实际使用时会被覆盖
      prefilledData: {
        expense: expensePrefilledData,
        document: documentPrefilledData
      },
      handlers: {
        expense: handleExpenseImport,
        document: handleDocumentImport
      }
    }
  }, [files, projectId, handleExpenseImport, handleDocumentImport])
}

/**
 * 检查文件是否适合特定导入类型的Hook
 */
export function useFileValidation(files: DroppedFileInfo[]) {
  return useMemo(() => {
    if (files.length === 0) {
      return {
        canImportExpense: false,
        canImportDocument: false,
        validationErrors: ['没有选择文件']
      }
    }

    if (files.length > 1) {
      return {
        canImportExpense: false,
        canImportDocument: false,
        validationErrors: ['一次只能导入一个文件']
      }
    }

    const file = files[0]
    const canImportExpense = ExpenseImportUtils.isInvoiceFile(file)
    const canImportDocument = DocumentImportUtils.isDocumentFile(file)
    const validationErrors: string[] = []

    if (!canImportExpense && !canImportDocument) {
      validationErrors.push('文件类型不支持导入')
    }

    return {
      canImportExpense,
      canImportDocument,
      validationErrors
    }
  }, [files])
}
