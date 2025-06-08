import { db } from '../../db'
import { logicalDocuments, documentVersions, managedFiles, projects } from '../../../db/schema'
import { eq, desc, and, count } from 'drizzle-orm'
import { IntelligentPathGeneratorService } from '../intelligent/intelligent-path-generator.service'
import { FilesystemOperations } from '../../utils/filesystem-operations'
import {
  validateCreateLogicalDocument,
  validateUpdateLogicalDocument,
  validateGetLogicalDocument,
  validateDeleteLogicalDocument,
  validateGetProjectDocuments
} from '../../types/document-schemas'
import type {
  CreateLogicalDocumentInput,
  UpdateLogicalDocumentInput,
  GetLogicalDocumentInput,
  DeleteLogicalDocumentInput,
  GetProjectDocumentsInput,
  SuccessResponse
} from '../../types/document-schemas'

/**
 * 逻辑文档服务
 * 负责逻辑文档的CRUD操作和业务逻辑
 */
export class LogicalDocumentService {
  /**
   * 创建逻辑文档
   */
  static async createLogicalDocument(input: CreateLogicalDocumentInput) {
    const validatedInput = validateCreateLogicalDocument(input)

    const result = await db
      .insert(logicalDocuments)
      .values({
        projectId: validatedInput.projectId,
        name: validatedInput.name,
        type: validatedInput.type,
        description: validatedInput.description,
        defaultStoragePathSegment: validatedInput.defaultStoragePathSegment,
        status: 'active'
      })
      .returning()

    console.log(`逻辑文档 "${validatedInput.name}" 创建成功`)
    return result[0]
  }

  /**
   * 获取单个逻辑文档
   */
  static async getLogicalDocument(input: GetLogicalDocumentInput) {
    const validatedInput = validateGetLogicalDocument(input)

    const result = await db
      .select()
      .from(logicalDocuments)
      .where(eq(logicalDocuments.id, validatedInput.id))
      .limit(1)

    return result[0] || null
  }

  /**
   * 获取所有逻辑文档
   */
  static async getAllDocuments() {
    // 先获取基本的逻辑文档信息
    const documents = await db
      .select({
        id: logicalDocuments.id,
        name: logicalDocuments.name,
        type: logicalDocuments.type,
        description: logicalDocuments.description,
        defaultStoragePathSegment: logicalDocuments.defaultStoragePathSegment,
        status: logicalDocuments.status,
        currentOfficialVersionId: logicalDocuments.currentOfficialVersionId,
        projectId: logicalDocuments.projectId,
        createdAt: logicalDocuments.createdAt,
        updatedAt: logicalDocuments.updatedAt
      })
      .from(logicalDocuments)
      .where(eq(logicalDocuments.status, 'active'))
      .orderBy(desc(logicalDocuments.updatedAt))

    // 为每个文档获取版本数量
    const result = await Promise.all(
      documents.map(async (doc) => {
        const versionCountResult = await db
          .select({ count: count() })
          .from(documentVersions)
          .where(eq(documentVersions.logicalDocumentId, doc.id))

        return {
          ...doc,
          versionCount: versionCountResult[0]?.count || 0
        }
      })
    )

    return result
  }

  /**
   * 获取项目的所有逻辑文档
   */
  static async getProjectDocuments(input: GetProjectDocumentsInput) {
    const validatedInput = validateGetProjectDocuments(input)

    // 先获取基本的逻辑文档信息
    const documents = await db
      .select({
        id: logicalDocuments.id,
        name: logicalDocuments.name,
        type: logicalDocuments.type,
        description: logicalDocuments.description,
        defaultStoragePathSegment: logicalDocuments.defaultStoragePathSegment,
        status: logicalDocuments.status,
        currentOfficialVersionId: logicalDocuments.currentOfficialVersionId,
        createdAt: logicalDocuments.createdAt,
        updatedAt: logicalDocuments.updatedAt
      })
      .from(logicalDocuments)
      .where(
        and(
          eq(logicalDocuments.projectId, validatedInput.projectId),
          eq(logicalDocuments.status, 'active')
        )
      )
      .orderBy(desc(logicalDocuments.updatedAt))

    // 为每个文档获取版本数量
    const result = await Promise.all(
      documents.map(async (doc) => {
        const versionCountResult = await db
          .select({ count: count() })
          .from(documentVersions)
          .where(eq(documentVersions.logicalDocumentId, doc.id))

        return {
          ...doc,
          versionCount: versionCountResult[0]?.count || 0
        }
      })
    )

    return result
  }

  /**
   * 更新逻辑文档
   */
  static async updateLogicalDocument(input: UpdateLogicalDocumentInput) {
    const validatedInput = validateUpdateLogicalDocument(input)
    const { id, ...updateData } = validatedInput

    // 如果要更新名称，需要先获取旧的文档信息和项目信息
    let oldDocument: typeof logicalDocuments.$inferSelect | null = null
    let project: typeof projects.$inferSelect | null = null
    if (updateData.name) {
      // 获取旧的逻辑文档信息
      const oldDocResult = await db
        .select()
        .from(logicalDocuments)
        .where(eq(logicalDocuments.id, id))
        .limit(1)

      if (oldDocResult.length === 0) {
        throw new Error('逻辑文档不存在')
      }
      oldDocument = oldDocResult[0]

      // 获取项目信息
      const projectResult = await db
        .select()
        .from(projects)
        .where(eq(projects.id, oldDocument.projectId))
        .limit(1)

      if (projectResult.length === 0) {
        throw new Error('关联的项目不存在')
      }
      project = projectResult[0]
    }

    // 更新数据库记录
    const result = await db
      .update(logicalDocuments)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(logicalDocuments.id, id))
      .returning()

    if (result.length === 0) {
      throw new Error('逻辑文档不存在')
    }

    const updatedDocument = result[0]

    // 如果名称发生了变化，同步重命名物理文件夹
    if (updateData.name && oldDocument && project && oldDocument.name !== updateData.name) {
      try {
        await this.syncDocumentFolderRename(
          project.name,
          project.id,
          oldDocument.name,
          updateData.name,
          id
        )
      } catch (error) {
        console.error('同步文档文件夹重命名失败:', error)
        // 注意：这里我们不抛出错误，因为数据库记录已经更新成功
        // 文件夹重命名失败不应该影响逻辑文档的更新
      }
    }

    console.log(`逻辑文档 "${updatedDocument.name}" 更新成功`)
    return updatedDocument
  }

  /**
   * 删除逻辑文档
   */
  static async deleteLogicalDocument(input: DeleteLogicalDocumentInput): Promise<SuccessResponse> {
    const validatedInput = validateDeleteLogicalDocument(input)

    // 检查是否有关联的文档版本
    const versions = await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.logicalDocumentId, validatedInput.id))
      .limit(1)

    if (versions.length > 0) {
      throw new Error('无法删除包含文档版本的逻辑文档，请先删除所有版本')
    }

    const result = await db
      .delete(logicalDocuments)
      .where(eq(logicalDocuments.id, validatedInput.id))
      .returning()

    if (result.length === 0) {
      throw new Error('逻辑文档不存在')
    }

    console.log(`逻辑文档 "${result[0].name}" 删除成功`)
    return { success: true }
  }

  /**
   * 获取逻辑文档的详细信息（包含版本列表）
   */
  static async getLogicalDocumentWithVersions(input: GetLogicalDocumentInput) {
    const validatedInput = validateGetLogicalDocument(input)

    // 获取逻辑文档基本信息
    const document = await this.getLogicalDocument(validatedInput)
    if (!document) {
      return null
    }

    // 获取所有版本
    const versions = await db
      .select({
        id: documentVersions.id,
        versionTag: documentVersions.versionTag,
        isGenericVersion: documentVersions.isGenericVersion,
        competitionMilestoneId: documentVersions.competitionMilestoneId,
        competitionProjectName: documentVersions.competitionProjectName,
        createdAt: documentVersions.createdAt,
        updatedAt: documentVersions.updatedAt,
        // 文件信息
        fileName: managedFiles.name,
        originalFileName: managedFiles.originalFileName,
        physicalPath: managedFiles.physicalPath,
        mimeType: managedFiles.mimeType,
        fileSizeBytes: managedFiles.fileSizeBytes,
        uploadedAt: managedFiles.uploadedAt
      })
      .from(documentVersions)
      .innerJoin(managedFiles, eq(documentVersions.managedFileId, managedFiles.id))
      .where(eq(documentVersions.logicalDocumentId, validatedInput.id))
      .orderBy(desc(documentVersions.createdAt))

    return {
      ...document,
      versions
    }
  }

  /**
   * 设置当前官方版本
   */
  static async setCurrentOfficialVersion(documentId: string, versionId: string) {
    // 验证版本是否属于该文档
    const version = await db
      .select()
      .from(documentVersions)
      .where(
        and(eq(documentVersions.id, versionId), eq(documentVersions.logicalDocumentId, documentId))
      )
      .limit(1)

    if (version.length === 0) {
      throw new Error('版本不存在或不属于该逻辑文档')
    }

    const result = await db
      .update(logicalDocuments)
      .set({
        currentOfficialVersionId: versionId,
        updatedAt: new Date()
      })
      .where(eq(logicalDocuments.id, documentId))
      .returning()

    console.log(`逻辑文档 "${result[0].name}" 的官方版本已设置`)
    return result[0]
  }

  /**
   * 同步逻辑文档文件夹重命名
   * 当逻辑文档名称变更时，重命名对应的物理文件夹并更新所有相关文件的路径
   */
  private static async syncDocumentFolderRename(
    projectName: string,
    projectId: string,
    oldDocumentName: string,
    newDocumentName: string,
    documentId: string
  ): Promise<void> {
    try {
      // 生成旧的和新的文件夹路径
      const oldFolderPath = await IntelligentPathGeneratorService.generateDocumentPath({
        projectName,
        projectId,
        logicalDocumentName: oldDocumentName
      })

      const newFolderPath = await IntelligentPathGeneratorService.generateDocumentPath({
        projectName,
        projectId,
        logicalDocumentName: newDocumentName
      })

      // 检查旧文件夹是否存在
      if (await FilesystemOperations.folderExists(oldFolderPath)) {
        // 检查新文件夹名是否已存在
        if (await FilesystemOperations.folderExists(newFolderPath)) {
          throw new Error(`目标文件夹已存在: ${newFolderPath}`)
        }

        // 重命名文件夹
        const success = await FilesystemOperations.renameFolder(oldFolderPath, newFolderPath)
        if (!success) {
          throw new Error('重命名文档文件夹失败')
        }

        console.log(`文档文件夹重命名成功: ${oldFolderPath} -> ${newFolderPath}`)

        // 更新所有相关文件的 physical_path
        await this.updateManagedFilesPath(documentId, oldFolderPath, newFolderPath)
      } else {
        console.warn(`旧文档文件夹不存在，跳过重命名: ${oldFolderPath}`)
      }
    } catch (error) {
      console.error('同步文档文件夹重命名失败:', error)
      throw error
    }
  }

  /**
   * 更新受管文件的物理路径
   * 当文件夹重命名后，更新数据库中所有相关文件的路径记录
   */
  private static async updateManagedFilesPath(
    documentId: string,
    oldFolderPath: string,
    newFolderPath: string
  ): Promise<void> {
    try {
      // 获取该逻辑文档下的所有文档版本
      const versions = await db
        .select({
          managedFileId: documentVersions.managedFileId
        })
        .from(documentVersions)
        .where(eq(documentVersions.logicalDocumentId, documentId))

      // 更新每个文件的路径
      for (const version of versions) {
        if (version.managedFileId) {
          // 获取当前文件信息
          const fileResult = await db
            .select()
            .from(managedFiles)
            .where(eq(managedFiles.id, version.managedFileId))
            .limit(1)

          if (fileResult.length > 0) {
            const file = fileResult[0]

            // 如果文件路径包含旧的文件夹路径，则更新
            if (file.physicalPath && file.physicalPath.startsWith(oldFolderPath)) {
              const newPhysicalPath = file.physicalPath.replace(oldFolderPath, newFolderPath)

              await db
                .update(managedFiles)
                .set({
                  physicalPath: newPhysicalPath,
                  updatedAt: new Date()
                })
                .where(eq(managedFiles.id, version.managedFileId))

              console.log(`文件路径已更新: ${file.physicalPath} -> ${newPhysicalPath}`)
            }
          }
        }
      }
    } catch (error) {
      console.error('更新受管文件路径失败:', error)
      throw error
    }
  }

  /**
   * 获取项目的所有逻辑文档（包含版本信息）
   * 专门为项目详情页设计
   */
  static async getProjectDocumentsWithVersions(projectId: string) {
    // 先获取基本的逻辑文档信息
    const documents = await db
      .select({
        id: logicalDocuments.id,
        name: logicalDocuments.name,
        type: logicalDocuments.type,
        description: logicalDocuments.description,
        defaultStoragePathSegment: logicalDocuments.defaultStoragePathSegment,
        status: logicalDocuments.status,
        currentOfficialVersionId: logicalDocuments.currentOfficialVersionId,
        createdAt: logicalDocuments.createdAt,
        updatedAt: logicalDocuments.updatedAt
      })
      .from(logicalDocuments)
      .where(and(eq(logicalDocuments.projectId, projectId), eq(logicalDocuments.status, 'active')))
      .orderBy(desc(logicalDocuments.updatedAt))

    // 为每个逻辑文档获取版本列表
    const documentsWithVersions = await Promise.all(
      documents.map(async (doc) => {
        const versions = await db
          .select({
            id: documentVersions.id,
            versionTag: documentVersions.versionTag,
            isGenericVersion: documentVersions.isGenericVersion,
            competitionMilestoneId: documentVersions.competitionMilestoneId,
            competitionProjectName: documentVersions.competitionProjectName,
            notes: documentVersions.notes,
            createdAt: documentVersions.createdAt,
            updatedAt: documentVersions.updatedAt,
            // 文件信息
            fileName: managedFiles.name,
            originalFileName: managedFiles.originalFileName,
            physicalPath: managedFiles.physicalPath,
            mimeType: managedFiles.mimeType,
            fileSizeBytes: managedFiles.fileSizeBytes,
            uploadedAt: managedFiles.uploadedAt
          })
          .from(documentVersions)
          .innerJoin(managedFiles, eq(documentVersions.managedFileId, managedFiles.id))
          .where(eq(documentVersions.logicalDocumentId, doc.id))
          .orderBy(desc(documentVersions.createdAt))

        return {
          ...doc,
          versions
        }
      })
    )

    return documentsWithVersions
  }

  /**
   * 获取文档类型列表
   */
  static async getDocumentTypes() {
    // 从数据库中获取所有已使用的文档类型
    const result = await db
      .selectDistinct({ type: logicalDocuments.type })
      .from(logicalDocuments)
      .where(eq(logicalDocuments.status, 'active'))

    // 预定义的常用文档类型
    const predefinedTypes = [
      { type: 'business_plan', label: '商业计划书', description: '项目商业计划书文档' },
      { type: 'presentation', label: 'PPT演示', description: '项目演示文稿' },
      { type: 'report', label: '项目报告', description: '项目相关报告文档' },
      { type: 'proposal', label: '项目提案', description: '项目提案文档' },
      { type: 'specification', label: '项目说明书', description: '项目技术或功能说明' },
      { type: 'manual', label: '使用手册', description: '产品或系统使用手册' },
      { type: 'contract', label: '合同协议', description: '项目相关合同文档' },
      { type: 'other', label: '其他文档', description: '其他类型文档' }
    ]

    // 合并预定义类型和数据库中的类型
    const usedTypes = result.map((r) => r.type)
    const allTypes = predefinedTypes.map((type) => ({
      ...type,
      isUsed: usedTypes.includes(type.type)
    }))

    return allTypes
  }
}
