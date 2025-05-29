import path from 'path'
import { IntelligentNamingService } from './intelligent-naming.service'
import { IntelligentPathGeneratorService } from './intelligent-path-generator.service'
import { ManagedFileService } from './managed-file.service'
import { LogicalDocumentService } from './document/logical-document.service'
import { DocumentVersionService } from './document/document-version.service'
import { FilesystemOperations } from '../utils/filesystem-operations'
import { PathUtils } from '../utils/path-utils'

export interface FileImportContext {
  // 文件基本信息
  sourcePath: string
  originalFileName: string
  displayName?: string

  // 导入类型
  importType: 'document' | 'asset' | 'expense' | 'shared' | 'competition' | 'inbox'

  // 项目相关信息（当 importType 为 document/asset/expense 时必需）
  projectId?: string
  projectName?: string

  // 文档相关信息（当 importType 为 document 时必需）
  logicalDocumentId?: string
  logicalDocumentName?: string
  logicalDocumentType?: string
  versionTag?: string
  isGenericVersion?: boolean
  competitionInfo?: {
    seriesName?: string
    levelName?: string
    projectName?: string
  }

  // 资产相关信息（当 importType 为 asset 时必需）
  assetType?: string
  assetName?: string

  // 经费相关信息（当 importType 为 expense 时必需）
  expenseDescription?: string
  applicantName?: string

  // 共享资源相关信息（当 importType 为 shared 时必需）
  resourceType?: string
  resourceName?: string
  customFields?: Record<string, any>

  // 比赛相关信息（当 importType 为 competition 时必需）
  seriesName?: string
  levelName?: string
  year?: number

  // 其他选项
  clarityFileRoot?: string
  preserveOriginalName?: boolean
  notes?: string
}

export interface FileImportResult {
  success: boolean
  managedFileId?: string
  finalPath?: string
  relativePath?: string
  generatedFileName?: string
  logicalDocumentId?: string
  documentVersionId?: string
  errors?: string[]
  warnings?: string[]
}

/**
 * 智能文件导入服务
 * 整合智能命名和路径生成，提供完整的文件导入和自动摆放功能
 */
export class IntelligentFileImportService {
  /**
   * 导入文件并自动摆放到正确位置
   * 严格按照 DIRECTORY_DESIGN.md 的文件系统映射策略执行
   */
  static async importFile(context: FileImportContext): Promise<FileImportResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 1. 验证输入参数
      const validationResult = this.validateImportContext(context)
      if (!validationResult.isValid) {
        return {
          success: false,
          errors: validationResult.errors
        }
      }

      // 2. 检查源文件是否存在
      if (!(await FilesystemOperations.fileExists(context.sourcePath))) {
        return {
          success: false,
          errors: ['源文件不存在']
        }
      }

      // 3. 验证文件类型是否支持当前导入类型
      if (!this.isFileTypeSupported(context.originalFileName, context.importType)) {
        warnings.push(`文件类型可能不适合 ${context.importType} 类型的导入`)
      }

      // 4. 检查是否为项目资源，如果是则验证项目信息
      const isProjectResource = this.isProjectResource(context.importType)
      if (isProjectResource && !this.validateProjectContext(context)) {
        return {
          success: false,
          errors: ['项目资源导入需要完整的项目信息']
        }
      }

      // 5. 生成智能文件名（按照设计文档规范）
      const generatedFileName = await this.generateIntelligentFileName(context)

      // 6. 生成目标路径（严格按照 DIRECTORY_DESIGN.md）
      const targetPath = await this.generateTargetPath(context)

      // 7. 确保目标目录存在
      const pathCreated = await IntelligentPathGeneratorService.ensurePathExists(targetPath)
      if (!pathCreated) {
        return {
          success: false,
          errors: ['无法创建目标目录']
        }
      }

      // 8. 检查文件名冲突并生成唯一文件名
      const existingFiles = await this.getExistingFilesInDirectory(targetPath)
      const uniqueFileName = IntelligentNamingService.generateUniqueFileName(
        generatedFileName,
        existingFiles
      )

      if (uniqueFileName !== generatedFileName) {
        warnings.push(`文件名已存在，自动重命名为: ${uniqueFileName}`)
      }

      // 9. 生成完整的目标文件路径
      const finalPath = path.join(targetPath, uniqueFileName)

      // 10. 验证生成的路径是否符合规范
      const pathValidation = IntelligentPathGeneratorService.validatePath(finalPath)
      if (!pathValidation.isValid) {
        return {
          success: false,
          errors: [`路径不符合规范: ${pathValidation.errors.join(', ')}`]
        }
      }

      // 11. 复制文件到目标位置
      const copySuccess = await FilesystemOperations.copyFile(context.sourcePath, finalPath)
      if (!copySuccess) {
        return {
          success: false,
          errors: ['文件复制失败']
        }
      }

      // 12. 获取文件信息
      const fileStats = await FilesystemOperations.getFileStats(finalPath)
      if (!fileStats) {
        return {
          success: false,
          errors: ['无法获取文件信息']
        }
      }

      // 13. 创建受管文件记录
      const managedFile = await ManagedFileService.createManagedFile({
        name: context.displayName || context.originalFileName,
        originalFileName: context.originalFileName,
        physicalPath: finalPath,
        mimeType: this.getMimeType(finalPath),
        fileSizeBytes: fileStats.size
      })

      // 14. 如果是文档类型，创建或更新逻辑文档和版本
      let logicalDocumentId: string | undefined
      let documentVersionId: string | undefined

      if (context.importType === 'document') {
        const docResult = await this.handleDocumentImport(context, managedFile.id)
        logicalDocumentId = docResult.logicalDocumentId
        documentVersionId = docResult.documentVersionId
        if (docResult.errors) {
          errors.push(...docResult.errors)
        }
      }

      // 15. 生成相对路径用于显示
      const relativePath = IntelligentPathGeneratorService.getRelativeDisplayPath(
        finalPath,
        context.clarityFileRoot
      )

      return {
        success: true,
        managedFileId: managedFile.id,
        finalPath,
        relativePath,
        generatedFileName: uniqueFileName,
        logicalDocumentId,
        documentVersionId,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    } catch (error) {
      console.error('文件导入失败:', error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : '未知错误']
      }
    }
  }

  /**
   * 预览文件导入方案（不实际导入文件）
   */
  static async previewImport(context: FileImportContext): Promise<{
    generatedFileName: string
    targetPath: string
    relativePath: string
    fullPath: string
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 验证输入参数
      const validationResult = this.validateImportContext(context)
      if (!validationResult.isValid) {
        return {
          generatedFileName: '',
          targetPath: '',
          relativePath: '',
          fullPath: '',
          isValid: false,
          errors: validationResult.errors,
          warnings
        }
      }

      // 生成智能文件名
      const generatedFileName = await this.generateIntelligentFileName(context)

      // 生成目标路径
      const targetPath = await this.generateTargetPath(context)

      // 生成完整路径
      const fullPath = path.join(targetPath, generatedFileName)

      // 生成相对路径
      const relativePath = IntelligentPathGeneratorService.getRelativeDisplayPath(
        fullPath,
        context.clarityFileRoot
      )

      // 验证路径
      const pathValidation = IntelligentPathGeneratorService.validatePath(fullPath)
      if (!pathValidation.isValid) {
        errors.push(...pathValidation.errors)
      }

      // 检查文件名冲突
      if (await FilesystemOperations.folderExists(targetPath)) {
        const existingFiles = await this.getExistingFilesInDirectory(targetPath)
        if (existingFiles.includes(generatedFileName)) {
          warnings.push('目标位置已存在同名文件，导入时将自动重命名')
        }
      }

      return {
        generatedFileName,
        targetPath,
        relativePath,
        fullPath,
        isValid: errors.length === 0,
        errors,
        warnings
      }
    } catch (error) {
      return {
        generatedFileName: '',
        targetPath: '',
        relativePath: '',
        fullPath: '',
        isValid: false,
        errors: [error instanceof Error ? error.message : '预览失败'],
        warnings
      }
    }
  }

  /**
   * 验证导入上下文
   */
  private static validateImportContext(context: FileImportContext): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // 基本信息验证
    if (!context.sourcePath) {
      errors.push('源文件路径不能为空')
    }
    if (!context.originalFileName) {
      errors.push('原始文件名不能为空')
    }
    if (!context.importType) {
      errors.push('导入类型不能为空')
    }

    // 根据导入类型验证必需字段
    switch (context.importType) {
      case 'document':
        if (!context.projectId) errors.push('项目ID不能为空')
        if (!context.projectName) errors.push('项目名称不能为空')
        if (!context.logicalDocumentName) errors.push('逻辑文档名称不能为空')
        if (!context.logicalDocumentType) errors.push('逻辑文档类型不能为空')
        if (!context.versionTag) errors.push('版本标签不能为空')
        break

      case 'asset':
        if (!context.projectId) errors.push('项目ID不能为空')
        if (!context.projectName) errors.push('项目名称不能为空')
        if (!context.assetType) errors.push('资产类型不能为空')
        if (!context.assetName) errors.push('资产名称不能为空')
        break

      case 'expense':
        if (!context.projectId) errors.push('项目ID不能为空')
        if (!context.projectName) errors.push('项目名称不能为空')
        if (!context.expenseDescription) errors.push('报销事项描述不能为空')
        break

      case 'shared':
        if (!context.resourceType) errors.push('资源类型不能为空')
        if (!context.resourceName) errors.push('资源名称不能为空')
        break

      case 'competition':
        if (!context.seriesName) errors.push('赛事系列名称不能为空')
        if (!context.levelName) errors.push('赛事级别不能为空')
        break

      case 'inbox':
        // Inbox 类型不需要额外验证
        break

      default:
        errors.push('不支持的导入类型')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 生成智能文件名
   */
  private static async generateIntelligentFileName(context: FileImportContext): Promise<string> {
    switch (context.importType) {
      case 'document':
        return IntelligentNamingService.generateDocumentVersionFileName({
          documentType: context.logicalDocumentType!,
          versionTag: context.versionTag!,
          isGenericVersion: context.isGenericVersion || false,
          competitionInfo: context.competitionInfo,
          originalFileName: context.originalFileName
        })

      case 'asset':
        return IntelligentNamingService.generateProjectAssetFileName({
          assetType: context.assetType!,
          assetName: context.assetName!,
          originalFileName: context.originalFileName
        })

      case 'shared':
        return IntelligentNamingService.generateSharedResourceFileName({
          resourceName: context.resourceName!,
          resourceType: context.resourceType!,
          customFields: context.customFields,
          originalFileName: context.originalFileName
        })

      case 'competition':
        return IntelligentNamingService.generateCompetitionNotificationFileName({
          seriesName: context.seriesName!,
          levelName: context.levelName!,
          originalFileName: context.originalFileName,
          year: context.year
        })

      case 'expense':
      case 'inbox':
      default:
        // 对于经费和临时文件，使用原始文件名（清理后）
        return PathUtils.sanitizeFileName(context.originalFileName)
    }
  }

  /**
   * 生成目标路径
   */
  private static async generateTargetPath(context: FileImportContext): Promise<string> {
    switch (context.importType) {
      case 'document':
        return await IntelligentPathGeneratorService.generateDocumentPath({
          projectName: context.projectName!,
          projectId: context.projectId!,
          logicalDocumentName: context.logicalDocumentName!,
          clarityFileRoot: context.clarityFileRoot
        })

      case 'asset':
        return await IntelligentPathGeneratorService.generateProjectAssetPath({
          projectName: context.projectName!,
          projectId: context.projectId!,
          assetType: context.assetType!,
          clarityFileRoot: context.clarityFileRoot
        })

      case 'expense':
        return await IntelligentPathGeneratorService.generateProjectExpensePath({
          projectName: context.projectName!,
          projectId: context.projectId!,
          expenseDescription: context.expenseDescription!,
          applicantName: context.applicantName,
          clarityFileRoot: context.clarityFileRoot
        })

      case 'shared':
        return await IntelligentPathGeneratorService.generateSharedResourcePath({
          resourceType: context.resourceType!,
          clarityFileRoot: context.clarityFileRoot
        })

      case 'competition':
        return await IntelligentPathGeneratorService.generateCompetitionPath({
          seriesName: context.seriesName!,
          levelName: context.levelName!,
          clarityFileRoot: context.clarityFileRoot
        })

      case 'inbox':
        return await IntelligentPathGeneratorService.generateInboxPath({
          clarityFileRoot: context.clarityFileRoot
        })

      default:
        throw new Error(`不支持的导入类型: ${context.importType}`)
    }
  }

  /**
   * 获取目录中已存在的文件列表
   */
  private static async getExistingFilesInDirectory(directoryPath: string): Promise<string[]> {
    try {
      if (!(await FilesystemOperations.folderExists(directoryPath))) {
        return []
      }

      const files = await FilesystemOperations.listFiles(directoryPath)
      return files.map((file) => path.basename(file))
    } catch (error) {
      console.warn(`获取目录文件列表失败: ${directoryPath}`, error)
      return []
    }
  }

  /**
   * 处理文档导入（创建或更新逻辑文档和版本）
   */
  private static async handleDocumentImport(
    context: FileImportContext,
    managedFileId: string
  ): Promise<{
    logicalDocumentId: string
    documentVersionId: string
    errors?: string[]
  }> {
    const errors: string[] = []

    try {
      // 1. 查找或创建逻辑文档
      let logicalDocumentId = context.logicalDocumentId

      if (!logicalDocumentId) {
        // 创建新的逻辑文档
        const logicalDocument = await LogicalDocumentService.createLogicalDocument({
          projectId: context.projectId!,
          name: context.logicalDocumentName!,
          type: context.logicalDocumentType!,
          description: context.notes,
          defaultStoragePathSegment: context.logicalDocumentName
        })
        logicalDocumentId = logicalDocument.id
      }

      // 2. 创建文档版本
      const documentVersion = await DocumentVersionService.createDocumentVersion({
        logicalDocumentId,
        managedFileId,
        versionTag: context.versionTag!,
        isGenericVersion: context.isGenericVersion || false,
        competitionMilestoneId: context.competitionInfo?.seriesName ? undefined : undefined, // TODO: 实现比赛里程碑关联
        competitionProjectName: context.competitionInfo?.projectName,
        notes: context.notes
      })

      return {
        logicalDocumentId,
        documentVersionId: documentVersion.id
      }
    } catch (error) {
      console.error('处理文档导入失败:', error)
      errors.push(error instanceof Error ? error.message : '文档处理失败')

      // 如果文档处理失败，仍然返回基本信息
      return {
        logicalDocumentId: context.logicalDocumentId || '',
        documentVersionId: '',
        errors
      }
    }
  }

  /**
   * 批量导入文件
   */
  static async batchImportFiles(contexts: FileImportContext[]): Promise<FileImportResult[]> {
    const results: FileImportResult[] = []

    for (const context of contexts) {
      try {
        const result = await this.importFile(context)
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          errors: [error instanceof Error ? error.message : '导入失败']
        })
      }
    }

    return results
  }

  /**
   * 获取支持的文件类型
   */
  static getSupportedFileTypes(): Record<string, string[]> {
    return {
      document: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt'],
      asset: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.mp4', '.mov', '.mp3', '.wav'],
      expense: ['.pdf', '.jpg', '.jpeg', '.png'],
      shared: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.zip', '.rar'],
      competition: ['.pdf', '.doc', '.docx', '.txt'],
      inbox: ['.*'] // 支持所有文件类型
    }
  }

  /**
   * 验证文件类型是否支持
   */
  static isFileTypeSupported(fileName: string, importType: string): boolean {
    const supportedTypes = this.getSupportedFileTypes()
    const fileExt = path.extname(fileName).toLowerCase()

    const typesForImport = supportedTypes[importType]
    if (!typesForImport) {
      return false
    }

    return typesForImport.includes('.*') || typesForImport.includes(fileExt)
  }

  /**
   * 检查导入类型是否为项目资源
   */
  private static isProjectResource(importType: string): boolean {
    return ['document', 'asset', 'expense'].includes(importType)
  }

  /**
   * 验证项目相关的上下文信息
   */
  private static validateProjectContext(context: FileImportContext): boolean {
    if (!context.projectId || !context.projectName) {
      return false
    }

    // 根据不同的导入类型验证特定字段
    switch (context.importType) {
      case 'document':
        return !!(context.logicalDocumentName && context.logicalDocumentType && context.versionTag)
      case 'asset':
        return !!(context.assetType && context.assetName)
      case 'expense':
        return !!context.expenseDescription
      default:
        return true
    }
  }

  /**
   * 获取文件MIME类型
   * 集中在此服务中，避免重复实现
   */
  private static getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed'
    }

    return mimeTypes[ext] || 'application/octet-stream'
  }
}
