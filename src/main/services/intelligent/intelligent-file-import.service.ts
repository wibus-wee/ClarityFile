import path from 'path'
import { z } from 'zod'
import { IntelligentNamingService } from './intelligent-naming.service'
import { IntelligentPathGeneratorService } from './intelligent-path-generator.service'
import { ManagedFileService } from '../managed-file.service'
import { LogicalDocumentService } from '../document/logical-document.service'
import { DocumentVersionService } from '../document/document-version.service'
import { FilesystemOperations } from '../../utils/filesystem-operations'
import { PathUtils } from '../../utils/path-utils'
import { MimeTypeUtils } from '../../utils/mime-type-utils'
import { db } from '../../db'
import { projects } from '../../../db/schema'
import { eq } from 'drizzle-orm'

const fileImportContextSchema = z
  .object({
    // 文件基本信息
    sourcePath: z.string().min(1, '源文件路径不能为空'),
    originalFileName: z.string().min(1, '原始文件名不能为空'),
    displayName: z.string().optional(),

    // 导入类型
    importType: z.enum(['document', 'asset', 'expense', 'shared', 'competition', 'inbox'], {
      errorMap: () => ({ message: '不支持的导入类型' })
    }),

    // 项目相关信息（当 importType 为 document/asset/expense 时必需）
    projectId: z.string().optional(),
    projectName: z.string().optional(),

    // 文档相关信息（当 importType 为 document 时必需）
    logicalDocumentId: z.string().optional(),
    logicalDocumentName: z.string().optional(),
    logicalDocumentType: z.string().optional(),
    versionTag: z.string().optional(),
    isGenericVersion: z.boolean().optional(),
    competitionInfo: z
      .object({
        seriesName: z.string().optional(),
        levelName: z.string().optional(),
        projectName: z.string().optional()
      })
      .optional(),

    // 资产相关信息（当 importType 为 asset 时必需）
    assetType: z.string().optional(),
    assetName: z.string().optional(),

    // 经费相关信息（当 importType 为 expense 时必需）
    expenseDescription: z.string().optional(),
    applicantName: z.string().optional(),

    // 共享资源相关信息（当 importType 为 shared 时必需）
    resourceType: z.string().optional(),
    resourceName: z.string().optional(),
    customFields: z.record(z.any()).optional(),

    // 比赛相关信息（当 importType 为 competition 时必需）
    seriesName: z.string().optional(),
    levelName: z.string().optional(),
    year: z.number().optional(),

    // 其他选项
    preserveOriginalName: z.boolean().optional(),
    notes: z.string().optional()
  })
  .superRefine((data, ctx) => {
    // 根据导入类型验证必需字段，提供详细的错误信息
    switch (data.importType) {
      case 'document':
        if (!data.projectId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '项目ID不能为空',
            path: ['projectId']
          })
        }
        if (!data.logicalDocumentName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '逻辑文档名称不能为空',
            path: ['logicalDocumentName']
          })
        }
        if (!data.logicalDocumentType) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '逻辑文档类型不能为空',
            path: ['logicalDocumentType']
          })
        }
        if (!data.versionTag) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '版本标签不能为空',
            path: ['versionTag']
          })
        }
        break

      case 'asset':
        if (!data.projectId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '项目ID不能为空',
            path: ['projectId']
          })
        }
        if (!data.assetType) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '资产类型不能为空',
            path: ['assetType']
          })
        }
        if (!data.assetName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '资产名称不能为空',
            path: ['assetName']
          })
        }
        break

      case 'expense':
        if (!data.projectId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '项目ID不能为空',
            path: ['projectId']
          })
        }
        if (!data.expenseDescription) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '报销事项描述不能为空',
            path: ['expenseDescription']
          })
        }
        break

      case 'shared':
        if (!data.resourceType) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '资源类型不能为空',
            path: ['resourceType']
          })
        }
        if (!data.resourceName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '资源名称不能为空',
            path: ['resourceName']
          })
        }
        break

      case 'competition':
        if (!data.seriesName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '赛事系列名称不能为空',
            path: ['seriesName']
          })
        }
        if (!data.levelName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '赛事级别不能为空',
            path: ['levelName']
          })
        }
        break

      case 'inbox':
        // Inbox 类型不需要额外验证
        break

      default:
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '不支持的导入类型',
          path: ['importType']
        })
    }
  })

export type FileImportContext = z.infer<typeof fileImportContextSchema>

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

      // 4. 验证已经在 zod schema 中完成，无需额外检查

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
        mimeType: MimeTypeUtils.getMimeType(finalPath),
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
      const relativePath = await IntelligentPathGeneratorService.getRelativeDisplayPath(finalPath)

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
      const relativePath = await IntelligentPathGeneratorService.getRelativeDisplayPath(fullPath)

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
   * 通过项目ID获取项目信息
   */
  private static async getProjectById(projectId: string) {
    const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1)

    if (result.length === 0) {
      throw new Error(`项目不存在: ${projectId}`)
    }

    return result[0]
  }

  /**
   * 验证导入上下文（使用 Zod 进行验证）
   */
  private static validateImportContext(context: FileImportContext): {
    isValid: boolean
    errors: string[]
  } {
    try {
      // 使用 zod schema 进行验证
      fileImportContextSchema.parse(context)
      return {
        isValid: true,
        errors: []
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // 提取所有验证错误信息
        const errors = error.errors.map((err) => err.message)
        return {
          isValid: false,
          errors
        }
      }

      // 处理其他类型的错误
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : '验证失败']
      }
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
      case 'document': {
        // 通过 projectId 查询项目名称
        const projectForDoc = await this.getProjectById(context.projectId!)
        return await IntelligentPathGeneratorService.generateDocumentPath({
          projectName: projectForDoc.name,
          projectId: context.projectId!,
          logicalDocumentName: context.logicalDocumentName!
        })
      }

      case 'asset': {
        // 通过 projectId 查询项目名称
        const projectForAsset = await this.getProjectById(context.projectId!)
        return await IntelligentPathGeneratorService.generateProjectAssetPath({
          projectName: projectForAsset.name,
          projectId: context.projectId!,
          assetType: context.assetType!
        })
      }

      case 'expense': {
        // 通过 projectId 查询项目名称
        const projectForExpense = await this.getProjectById(context.projectId!)
        return await IntelligentPathGeneratorService.generateProjectExpensePath({
          projectName: projectForExpense.name,
          projectId: context.projectId!,
          expenseDescription: context.expenseDescription!,
          applicantName: context.applicantName
        })
      }

      case 'shared':
        return await IntelligentPathGeneratorService.generateSharedResourcePath({
          resourceType: context.resourceType!
        })

      case 'competition':
        return await IntelligentPathGeneratorService.generateCompetitionPath({
          seriesName: context.seriesName!,
          levelName: context.levelName!
        })

      case 'inbox':
        return await IntelligentPathGeneratorService.generateInboxPath({})

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
          type: context.logicalDocumentType! as any,
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
    const typesForImport = supportedTypes[importType]

    if (!typesForImport) {
      return false
    }

    return MimeTypeUtils.isFileTypeSupported(fileName, typesForImport)
  }
}
