import type { DroppedFileInfo, ExpenseImportConfig, ImportHandlerResult } from './types'
import { validateFileForImportType } from './utils'
import { useGlobalDrawersStore } from '@renderer/stores/global-drawers'
import { toast } from 'sonner'

/**
 * 发票报销导入处理器
 * 处理发票文件导入并集成到 expense-form-drawer
 */
export class ExpenseImportHandler {
  /**
   * 处理发票报销导入
   * @param files 拖拽的文件列表
   * @param config 导入配置
   * @returns 处理结果
   */
  static async handleImport(
    files: DroppedFileInfo[],
    config: ExpenseImportConfig = {}
  ): Promise<ImportHandlerResult> {
    try {
      // 验证文件
      const validationResult = this.validateFiles(files)
      if (!validationResult.success) {
        return validationResult
      }

      // 目前只支持单个文件导入
      const file = files[0]

      // 打开 expense-form-drawer 并预填充文件信息
      await this.openExpenseFormWithFile(file, config)

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
  }

  /**
   * 验证文件是否适合发票报销导入
   */
  private static validateFiles(files: DroppedFileInfo[]): ImportHandlerResult {
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
  }

  /**
   * 打开 expense-form-drawer 并预填充文件信息
   */
  private static async openExpenseFormWithFile(
    file: DroppedFileInfo,
    config: ExpenseImportConfig
  ): Promise<void> {
    // 推断表单数据
    const inferredItemName = this.inferExpenseItemFromFile(file)
    const inferredAmount = this.inferAmountFromFile(file)

    // 使用全局状态管理打开 expense-form-drawer
    const { openExpenseForm } = useGlobalDrawersStore.getState()

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
  }

  /**
   * 从文件名推断报销物品名称
   * 解析格式：物品名称_金额.pdf（如 "无尘布_24.pdf" → "无尘布"）
   */
  static inferExpenseItemFromFile(file: DroppedFileInfo): string {
    const fileName = file.name

    // 移除文件扩展名
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')

    // 尝试解析 "物品名称_金额" 格式
    const match = nameWithoutExt.match(/^(.+?)_\d+(\.\d+)?$/)
    if (match && match[1]) {
      // 返回物品名称部分，清理多余的空格和特殊字符
      return match[1].trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')
    }

    // 如果解析失败，返回空字符串
    return ''
  }

  /**
   * 从文件名推断报销金额
   * 解析格式：物品名称_金额.pdf（如 "无尘布_24.pdf" → 24）
   */
  static inferAmountFromFile(file: DroppedFileInfo): number | null {
    const fileName = file.name

    // 移除文件扩展名
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')

    // 尝试解析 "物品名称_金额" 格式
    const match = nameWithoutExt.match(/^.+?_(\d+(?:\.\d+)?)$/)
    if (match && match[1]) {
      const amount = parseFloat(match[1])
      // 验证金额是否为有效数字且大于0
      if (!isNaN(amount) && amount > 0) {
        return amount
      }
    }

    // 如果解析失败，返回 null
    return null
  }

  /**
   * 检查文件是否为发票文件
   */
  static isInvoiceFile(file: DroppedFileInfo): boolean {
    const fileName = file.name.toLowerCase()
    const invoiceKeywords = ['发票', 'invoice', '票据', '收据', 'receipt']

    return invoiceKeywords.some((keyword) => fileName.includes(keyword)) || file.extension === 'pdf'
  }
}
