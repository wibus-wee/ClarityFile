import { useCallback } from 'react'
import type { DroppedFileInfo, ExpenseImportConfig, ImportHandlerResult } from '../core/types'
import { validateFileForImportType } from '../core/utils'
import { useGlobalDrawersStore } from '@renderer/stores/global-drawers'
import { toast } from 'sonner'

/**
 * 发票报销导入自定义Hook
 * 处理发票文件导入并集成到 expense-form-drawer
 */
export function useExpenseImportHandler() {
  const { openExpenseForm } = useGlobalDrawersStore()

  /**
   * 验证文件是否适合发票报销导入
   */
  const validateFiles = useCallback((files: DroppedFileInfo[]): ImportHandlerResult => {
    if (files.length === 0) {
      return {
        success: false,
        error: '没有选择文件'
      }
    }

    if (files.length > 1) {
      return {
        success: false,
        error: '发票报销一次只能导入一个文件'
      }
    }

    const file = files[0]
    const validation = validateFileForImportType(file, 'expense')

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.reason
      }
    }

    return {
      success: true
    }
  }, [])

  /**
   * 打开 expense-form-drawer 并预填充文件信息
   */
  const openExpenseFormWithFile = useCallback(
    async (file: DroppedFileInfo, config: ExpenseImportConfig): Promise<void> => {
      // 推断表单数据
      const inferredItemName = ExpenseImportUtils.inferExpenseItemFromFile(file)
      const inferredAmount = ExpenseImportUtils.inferAmountFromFile(file)

      openExpenseForm({
        mode: 'create',
        projectId: config.projectId,
        preselectedFile: file,
        prefilledData: {
          itemName: config.itemName || inferredItemName,
          amount: config.amount || inferredAmount || undefined,
          notes: `导入文件：${file.name}`
        }
      })

      toast.success(`准备导入发票文件：${file.name}`, {
        description: '正在打开报销表单...'
      })
    },
    [openExpenseForm]
  )

  /**
   * 处理发票报销导入
   */
  const handleImport = useCallback(
    async (
      files: DroppedFileInfo[],
      config: ExpenseImportConfig = {}
    ): Promise<ImportHandlerResult> => {
      try {
        // 验证文件
        const validationResult = validateFiles(files)
        if (!validationResult.success) {
          return validationResult
        }

        // 目前只支持单个文件导入
        const file = files[0]

        // 打开 expense-form-drawer 并预填充文件信息
        await openExpenseFormWithFile(file, config)

        return {
          success: true,
          processedCount: 1
        }
      } catch (error) {
        console.error('发票报销导入失败:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : '导入失败'
        }
      }
    },
    [validateFiles, openExpenseFormWithFile]
  )

  return {
    handleImport,
    validateFiles,
    openExpenseFormWithFile
  }
}

/**
 * 发票报销导入工具函数
 * 提供文件解析和验证的纯函数
 */
export const ExpenseImportUtils = {
  /**
   * 从文件名推断报销物品名称
   * 解析格式：物品名称_金额.pdf（如 "无尘布_24.pdf" → "无尘布"）
   */
  inferExpenseItemFromFile(file: DroppedFileInfo): string {
    const fileName = file.name

    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
    const normalizedName = nameWithoutExt.replace(/[_-]+/g, ' ')

    const structuredMatch = normalizedName.match(/^(.+?)\s*\d+(?:\.\d+)?$/)
    if (structuredMatch && structuredMatch[1]) {
      return structuredMatch[1].trim().replace(/\s+/g, ' ')
    }

    const fallbackName = normalizedName.replace(/\d+/g, ' ').replace(/\s+/g, ' ').trim()

    return fallbackName
  },

  /**
   * 从文件名推断报销金额
   * 解析格式：物品名称_金额.pdf（如 "无尘布_24.pdf" → 24）
   */
  inferAmountFromFile(file: DroppedFileInfo): number | null {
    const fileName = file.name

    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')

    const numericMatch = nameWithoutExt.match(/(\d+(?:\.\d+)?)/)
    if (numericMatch && numericMatch[1]) {
      const amount = parseFloat(numericMatch[1])
      if (!isNaN(amount) && amount > 0) {
        return amount
      }
    }

    return null
  },

  /**
   * 检查文件是否为发票文件
   */
  isInvoiceFile(file: DroppedFileInfo): boolean {
    const fileName = file.name.toLowerCase()
    const invoiceKeywords = ['发票', 'invoice', '票据', '收据', 'receipt']

    return invoiceKeywords.some((keyword) => fileName.includes(keyword)) || file.extension === 'pdf'
  }
}
