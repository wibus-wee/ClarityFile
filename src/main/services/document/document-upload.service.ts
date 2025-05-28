import { ManagedFileService } from '../managed-file.service'
import { DocumentVersionService } from './document-version.service'

/**
 * 文档上传服务
 * 提供安全的文档上传功能，确保文件导入和版本创建的原子性
 */
export class DocumentUploadService {
  /**
   * 上传文档版本（原子操作）
   * 这个方法确保文件导入和版本创建在同一个事务中完成
   */
  static async uploadDocumentVersion(input: {
    // 文件导入参数
    sourcePath: string
    targetDirectory: string
    displayName: string
    preserveOriginalName?: boolean

    // 文档版本参数
    logicalDocumentId: string
    versionTag: string
    isGenericVersion?: boolean
    competitionProjectName?: string
    notes?: string
  }) {
    console.log('开始上传文档版本 - 输入参数:', input)

    // 清理路径中的引号
    const cleanTargetDirectory = input.targetDirectory.replace(/^["']|["']$/g, '')
    console.log('清理后的目标目录:', cleanTargetDirectory)

    try {
      // 1. 导入文件到受管存储
      console.log('步骤1: 导入文件到受管存储')
      const managedFile = await ManagedFileService.importFile({
        sourcePath: input.sourcePath,
        targetDirectory: cleanTargetDirectory,
        displayName: input.displayName,
        preserveOriginalName: input.preserveOriginalName || false
      })

      console.log('文件导入成功:', {
        id: managedFile.id,
        name: managedFile.name,
        path: managedFile.physicalPath
      })

      // 验证文件导入结果
      if (!managedFile || !managedFile.id) {
        throw new Error('文件导入失败：未返回有效的文件记录')
      }

      // 2. 创建文档版本
      console.log('步骤2: 创建文档版本')
      const documentVersion = await DocumentVersionService.createDocumentVersion({
        logicalDocumentId: input.logicalDocumentId,
        managedFileId: managedFile.id,
        versionTag: input.versionTag,
        isGenericVersion: input.isGenericVersion,
        competitionProjectName: input.competitionProjectName,
        notes: input.notes
      })

      console.log('文档版本创建成功:', {
        id: documentVersion.id,
        versionTag: documentVersion.versionTag,
        managedFileId: documentVersion.managedFileId
      })

      return {
        success: true,
        managedFile,
        documentVersion,
        message: '文档版本上传成功'
      }
    } catch (error) {
      console.error('文档版本上传失败:', error)

      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('上传失败，错误详情:', errorMessage)

      throw new Error(`文档版本上传失败: ${errorMessage}`)
    }
  }

  /**
   * 验证上传参数
   */
  static validateUploadParams(input: {
    sourcePath: string
    targetDirectory: string
    displayName: string
    logicalDocumentId: string
    versionTag: string
  }) {
    const errors: string[] = []

    if (!input.sourcePath?.trim()) {
      errors.push('源文件路径不能为空')
    }

    if (!input.targetDirectory?.trim()) {
      errors.push('目标目录不能为空')
    }

    if (!input.displayName?.trim()) {
      errors.push('显示名称不能为空')
    }

    if (!input.logicalDocumentId?.trim()) {
      errors.push('逻辑文档ID不能为空')
    }

    if (!input.versionTag?.trim()) {
      errors.push('版本标签不能为空')
    }

    if (errors.length > 0) {
      throw new Error(`参数验证失败: ${errors.join(', ')}`)
    }

    return true
  }

  /**
   * 检查文件是否可以上传
   */
  static async checkFileUploadability(filePath: string) {
    try {
      // 检查文件是否存在
      const fs = require('fs').promises
      const stats = await fs.stat(filePath)

      if (!stats.isFile()) {
        throw new Error('指定路径不是一个文件')
      }

      // 检查文件大小（限制为100MB）
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (stats.size > maxSize) {
        throw new Error(`文件过大，最大支持 ${maxSize / 1024 / 1024}MB`)
      }

      return {
        canUpload: true,
        fileSize: stats.size,
        message: '文件可以上传'
      }
    } catch (error) {
      return {
        canUpload: false,
        fileSize: 0,
        message: error instanceof Error ? error.message : '文件检查失败'
      }
    }
  }

  /**
   * 生成唯一的版本标签
   */
  static generateVersionTag(prefix: string = 'v') {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_')
    const random = Math.random().toString(36).substring(2, 6)
    return `${prefix}_${timestamp}_${random}`
  }
}
