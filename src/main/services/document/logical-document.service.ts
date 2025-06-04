import { db } from '../../db'
import { logicalDocuments, documentVersions, managedFiles } from '../../../db/schema'
import { eq, desc, and, count } from 'drizzle-orm'
import type { SuccessResponse } from '../../types/outputs'

export interface CreateLogicalDocumentInput {
  projectId: string
  name: string
  type: string
  description?: string
  defaultStoragePathSegment?: string
}

export interface UpdateLogicalDocumentInput {
  id: string
  name?: string
  type?: string
  description?: string
  defaultStoragePathSegment?: string
  status?: string
}

export interface GetLogicalDocumentInput {
  id: string
}

export interface DeleteLogicalDocumentInput {
  id: string
}

export interface GetProjectDocumentsInput {
  projectId: string
}

/**
 * 逻辑文档服务
 * 负责逻辑文档的CRUD操作和业务逻辑
 */
export class LogicalDocumentService {
  /**
   * 创建逻辑文档
   */
  static async createLogicalDocument(input: CreateLogicalDocumentInput) {
    const result = await db
      .insert(logicalDocuments)
      .values({
        projectId: input.projectId,
        name: input.name,
        type: input.type,
        description: input.description,
        defaultStoragePathSegment: input.defaultStoragePathSegment,
        status: 'active'
      })
      .returning()

    console.log(`逻辑文档 "${input.name}" 创建成功`)
    return result[0]
  }

  /**
   * 获取单个逻辑文档
   */
  static async getLogicalDocument(input: GetLogicalDocumentInput) {
    const result = await db
      .select()
      .from(logicalDocuments)
      .where(eq(logicalDocuments.id, input.id))
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
        and(eq(logicalDocuments.projectId, input.projectId), eq(logicalDocuments.status, 'active'))
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
    const { id, ...updateData } = input

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

    console.log(`逻辑文档 "${result[0].name}" 更新成功`)
    return result[0]
  }

  /**
   * 删除逻辑文档
   */
  static async deleteLogicalDocument(input: DeleteLogicalDocumentInput): Promise<SuccessResponse> {
    // 检查是否有关联的文档版本
    const versions = await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.logicalDocumentId, input.id))
      .limit(1)

    if (versions.length > 0) {
      throw new Error('无法删除包含文档版本的逻辑文档，请先删除所有版本')
    }

    const result = await db
      .delete(logicalDocuments)
      .where(eq(logicalDocuments.id, input.id))
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
    // 获取逻辑文档基本信息
    const document = await this.getLogicalDocument(input)
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
      .where(eq(documentVersions.logicalDocumentId, input.id))
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
