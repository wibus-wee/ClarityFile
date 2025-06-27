import type { DocumentType } from '@main/types/document-schemas'

/**
 * 导入助手的导入类型
 */
export type ImportAssistantType = 'expense' | 'document'

/**
 * 拖拽文件信息
 */
export interface DroppedFileInfo {
  /** 文件路径 */
  path: string
  /** 原始文件名 */
  name: string
  /** 文件大小（字节） */
  size: number
  /** MIME 类型 */
  type: string
  /** 文件扩展名 */
  extension: string
}

/**
 * 导入助手状态
 */
export interface ImportAssistantState {
  /** 是否显示导入助手 */
  isOpen: boolean
  /** 当前拖拽的文件列表 */
  droppedFiles: DroppedFileInfo[]
  /** 选择的导入类型 */
  selectedImportType: ImportAssistantType | null
  /** 是否正在处理 */
  isProcessing: boolean
  /** 处理步骤描述 */
  processingStep: string | null
}

/**
 * 导入助手操作
 */
export interface ImportAssistantActions {
  /** 打开导入助手 */
  openImportAssistant: (files: DroppedFileInfo[]) => void
  /** 关闭导入助手 */
  closeImportAssistant: () => void
  /** 选择导入类型 */
  selectImportType: (type: ImportAssistantType) => void
  /** 设置处理状态 */
  setProcessing: (isProcessing: boolean, step?: string) => void
  /** 重置状态 */
  reset: () => void
}

/**
 * 发票报销导入配置
 */
export interface ExpenseImportConfig {
  /** 目标项目ID（可选，用户可在表单中选择） */
  projectId?: string
  /** 预填充的报销项目名称 */
  itemName?: string
  /** 预填充的申请人 */
  applicant?: string
}

/**
 * 文档导入配置
 */
export interface DocumentImportConfig {
  /** 目标项目ID */
  projectId: string
  /** 逻辑文档ID（如果是添加版本） */
  logicalDocumentId?: string
  /** 逻辑文档名称（如果是创建新文档） */
  logicalDocumentName?: string
  /** 逻辑文档类型（如果是创建新文档） */
  logicalDocumentType?: DocumentType
  /** 版本标签 */
  versionTag?: string
  /** 是否为通用版本 */
  isGenericVersion?: boolean
  /** 备注 */
  notes?: string
  /** 强制创建新文档（不检查现有文档） */
  forceCreateNew?: boolean
  /** 强制为现有文档添加版本（需要用户选择文档） */
  forceAddVersion?: boolean
}

/**
 * 导入处理结果
 */
export interface ImportHandlerResult {
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 警告信息 */
  warnings?: string[]
  /** 处理的文件数量 */
  processedCount?: number
}

/**
 * 文件类型检测结果
 */
export interface FileTypeDetection {
  /** 是否为发票文件（PDF） */
  isInvoice: boolean
  /** 是否为文档文件 */
  isDocument: boolean
  /** 推荐的导入类型 */
  recommendedType: ImportAssistantType | null
  /** 检测置信度 (0-1) */
  confidence: number
}
