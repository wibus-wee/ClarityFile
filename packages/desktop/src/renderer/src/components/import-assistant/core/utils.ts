import type { DroppedFileInfo, FileTypeDetection, ImportAssistantType } from './types'

/**
 * 从文件路径提取文件信息
 */
export function extractFileInfo(filePath: string): Partial<DroppedFileInfo> {
  const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || ''
  const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() || '' : ''

  return {
    path: filePath,
    name: fileName,
    extension
  }
}

/**
 * 从 File 对象提取文件信息
 */
export function extractFileInfoFromFile(file: File): Partial<DroppedFileInfo> {
  const fileName = file.name
  const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() || '' : ''

  // 在 Electron 环境中，使用 webUtils.getPathForFile 获取完整的文件系统路径
  // 这是官方推荐的方法，替代了已被移除的 File.path 属性
  let filePath: string
  try {
    filePath = window.api.getPathForFile(file)
  } catch (error) {
    // 如果获取路径失败，回退到使用文件名
    console.warn('无法获取文件路径，使用文件名作为回退:', error)
    filePath = file.name
  }

  return {
    path: filePath, // 使用真实的文件路径（Electron）或文件名（回退）
    name: fileName,
    extension
  }
}

/**
 * 检测文件类型并推荐导入方式
 */
export function detectFileType(file: DroppedFileInfo): FileTypeDetection {
  const { extension, name, type } = file
  const ext = extension.toLowerCase()
  const fileName = name.toLowerCase()

  // 检测是否为发票文件
  const isInvoice =
    ext === 'pdf' &&
    (fileName.includes('发票') ||
      fileName.includes('invoice') ||
      fileName.includes('receipt') ||
      fileName.includes('票据'))

  // 检测是否为文档文件
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'md', 'ppt', 'pptx']
  const isDocument = documentExtensions.includes(ext)

  // 推荐导入类型
  let recommendedType: ImportAssistantType | null = null
  let confidence = 0

  if (isInvoice) {
    recommendedType = 'expense'
    confidence = 0.8
  } else if (isDocument) {
    recommendedType = 'document'
    confidence = 0.6
  }

  // 基于 MIME 类型进一步判断
  if (type) {
    if (type.includes('pdf') && fileName.includes('发票')) {
      recommendedType = 'expense'
      confidence = 0.9
    } else if (type.includes('document') || type.includes('text')) {
      recommendedType = 'document'
      confidence = Math.max(confidence, 0.7)
    }
  }

  return {
    isInvoice,
    isDocument,
    recommendedType,
    confidence
  }
}

/**
 * 验证文件是否适合指定的导入类型
 */
export function validateFileForImportType(
  file: DroppedFileInfo,
  importType: ImportAssistantType
): { isValid: boolean; reason?: string } {
  const { extension } = file
  const ext = extension.toLowerCase()

  switch (importType) {
    case 'expense':
      // 发票报销主要支持 PDF 文件
      if (ext !== 'pdf') {
        return {
          isValid: false,
          reason: '发票报销建议使用 PDF 格式的文件'
        }
      }
      break

    case 'document': {
      // 文档导入支持多种格式
      const supportedExts = ['pdf', 'doc', 'docx', 'txt', 'md', 'ppt', 'pptx']
      if (!supportedExts.includes(ext)) {
        return {
          isValid: false,
          reason: `不支持的文档格式：${ext.toUpperCase()}`
        }
      }
      break
    }

    default:
      return {
        isValid: false,
        reason: '未知的导入类型'
      }
  }

  return { isValid: true }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 检查文件大小是否合理
 */
export function validateFileSize(file: DroppedFileInfo): { isValid: boolean; reason?: string } {
  const maxSize = 100 * 1024 * 1024 // 100MB

  if (file.size > maxSize) {
    return {
      isValid: false,
      reason: `文件过大：${formatFileSize(file.size)}，最大支持 ${formatFileSize(maxSize)}`
    }
  }

  if (file.size === 0) {
    return {
      isValid: false,
      reason: '文件为空'
    }
  }

  return { isValid: true }
}
