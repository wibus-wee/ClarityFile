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
    const inferredItemName = this.inferItemNameFromFile(file)
    const inferredApplicant = this.inferApplicantFromFile(file)

    // 使用全局状态管理打开 expense-form-drawer
    const { openExpenseForm } = useGlobalDrawersStore.getState()

    openExpenseForm({
      mode: 'create',
      projectId: config.projectId,
      preselectedFile: file,
      prefilledData: {
        itemName: config.itemName || inferredItemName,
        applicant: config.applicant || inferredApplicant,
        notes: `导入文件：${file.name}`
      }
    })

    toast.success(`准备导入发票文件：${file.name}`, {
      description: '正在打开报销表单...'
    })
  }

  /**
   * 从文件名推断报销项目名称
   */
  static inferItemNameFromFile(file: DroppedFileInfo): string {
    const fileName = file.name.toLowerCase()

    // 常见的报销项目关键词映射
    const itemKeywords = {
      办公: ['办公', 'office', '文具', '纸张', '笔'],
      差旅: ['差旅', '机票', '火车', '酒店', '住宿', 'hotel', 'flight'],
      餐饮: ['餐饮', '用餐', '食堂', '外卖', 'meal', 'food'],
      交通: ['交通', '打车', '地铁', '公交', 'taxi', 'uber'],
      会议: ['会议', '培训', 'meeting', 'conference'],
      设备: ['设备', '电脑', '硬件', 'equipment', 'computer'],
      软件: ['软件', 'software', '订阅', 'subscription'],
      材料: ['材料', '实验', 'material', 'lab']
    }

    for (const [category, keywords] of Object.entries(itemKeywords)) {
      if (keywords.some((keyword) => fileName.includes(keyword))) {
        return `${category}费用`
      }
    }

    // 如果没有匹配到关键词，返回通用名称
    return '报销费用'
  }

  /**
   * 从文件名推断申请人
   */
  static inferApplicantFromFile(file: DroppedFileInfo): string {
    const fileName = file.name

    // 尝试从文件名中提取可能的姓名
    // 这里可以根据实际需求添加更复杂的逻辑
    const namePattern = /[\u4e00-\u9fa5]{2,4}/g
    const matches = fileName.match(namePattern)

    if (matches && matches.length > 0) {
      // 返回第一个匹配的中文姓名
      return matches[0]
    }

    return ''
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
