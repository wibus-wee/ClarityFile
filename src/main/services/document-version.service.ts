import { db } from '../db'
import { documentVersions, managedFiles, logicalDocuments } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import type { SuccessResponse } from '../types/outputs'

export interface CreateDocumentVersionInput {
  logicalDocumentId: string
  managedFileId: string
  versionTag: string
  isGenericVersion?: boolean
  competitionMilestoneId?: string
  competitionProjectName?: string
  notes?: string
}

export interface UpdateDocumentVersionInput {
  id: string
  versionTag?: string
  isGenericVersion?: boolean
  competitionMilestoneId?: string
  competitionProjectName?: string
  notes?: string
}

export interface GetDocumentVersionInput {
  id: string
}

export interface DeleteDocumentVersionInput {
  id: string
}

export interface GetLogicalDocumentVersionsInput {
  logicalDocumentId: string
}

/**
 * 文档版本服务
 * 负责文档版本的CRUD操作和版本管理逻辑
 */
export class DocumentVersionService {
  /**
   * 创建文档版本
   */
  static async createDocumentVersion(input: CreateDocumentVersionInput) {
    // 验证逻辑文档是否存在
    const logicalDoc = await db
      .select()
      .from(logicalDocuments)
      .where(eq(logicalDocuments.id, input.logicalDocumentId))
      .limit(1)

    if (logicalDoc.length === 0) {
      throw new Error('逻辑文档不存在')
    }

    // 验证受管文件是否存在
    const managedFile = await db
      .select()
      .from(managedFiles)
      .where(eq(managedFiles.id, input.managedFileId))
      .limit(1)

    if (managedFile.length === 0) {
      throw new Error('受管文件不存在')
    }

    // 检查该文件是否已经被其他版本使用
    const existingVersion = await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.managedFileId, input.managedFileId))
      .limit(1)

    if (existingVersion.length > 0) {
      throw new Error('该文件已被其他文档版本使用')
    }

    const result = await db
      .insert(documentVersions)
      .values({
        logicalDocumentId: input.logicalDocumentId,
        managedFileId: input.managedFileId,
        versionTag: input.versionTag,
        isGenericVersion: input.isGenericVersion || false,
        competitionMilestoneId: input.competitionMilestoneId,
        competitionProjectName: input.competitionProjectName,
        notes: input.notes
      })
      .returning()

    console.log(`文档版本 "${input.versionTag}" 创建成功`)
    return result[0]
  }

  /**
   * 获取单个文档版本
   */
  static async getDocumentVersion(input: GetDocumentVersionInput) {
    const result = await db
      .select({
        id: documentVersions.id,
        logicalDocumentId: documentVersions.logicalDocumentId,
        versionTag: documentVersions.versionTag,
        isGenericVersion: documentVersions.isGenericVersion,
        competitionMilestoneId: documentVersions.competitionMilestoneId,
        competitionProjectName: documentVersions.competitionProjectName,
        notes: documentVersions.notes,
        createdAt: documentVersions.createdAt,
        updatedAt: documentVersions.updatedAt,
        // 文件信息
        managedFileId: managedFiles.id,
        fileName: managedFiles.name,
        originalFileName: managedFiles.originalFileName,
        physicalPath: managedFiles.physicalPath,
        mimeType: managedFiles.mimeType,
        fileSizeBytes: managedFiles.fileSizeBytes,
        fileHash: managedFiles.fileHash,
        uploadedAt: managedFiles.uploadedAt,
        // 逻辑文档信息
        logicalDocumentName: logicalDocuments.name,
        logicalDocumentType: logicalDocuments.type
      })
      .from(documentVersions)
      .innerJoin(managedFiles, eq(documentVersions.managedFileId, managedFiles.id))
      .innerJoin(logicalDocuments, eq(documentVersions.logicalDocumentId, logicalDocuments.id))
      .where(eq(documentVersions.id, input.id))
      .limit(1)

    return result[0] || null
  }

  /**
   * 获取逻辑文档的所有版本
   */
  static async getLogicalDocumentVersions(input: GetLogicalDocumentVersionsInput) {
    const result = await db
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
        managedFileId: managedFiles.id,
        fileName: managedFiles.name,
        originalFileName: managedFiles.originalFileName,
        physicalPath: managedFiles.physicalPath,
        mimeType: managedFiles.mimeType,
        fileSizeBytes: managedFiles.fileSizeBytes,
        uploadedAt: managedFiles.uploadedAt
      })
      .from(documentVersions)
      .innerJoin(managedFiles, eq(documentVersions.managedFileId, managedFiles.id))
      .where(eq(documentVersions.logicalDocumentId, input.logicalDocumentId))
      .orderBy(desc(documentVersions.createdAt))

    return result
  }

  /**
   * 更新文档版本
   */
  static async updateDocumentVersion(input: UpdateDocumentVersionInput) {
    const { id, ...updateData } = input

    const result = await db
      .update(documentVersions)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(documentVersions.id, id))
      .returning()

    if (result.length === 0) {
      throw new Error('文档版本不存在')
    }

    console.log(`文档版本 "${result[0].versionTag}" 更新成功`)
    return result[0]
  }

  /**
   * 删除文档版本
   */
  static async deleteDocumentVersion(input: DeleteDocumentVersionInput): Promise<SuccessResponse> {
    // 获取版本信息
    const version = await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.id, input.id))
      .limit(1)

    if (version.length === 0) {
      throw new Error('文档版本不存在')
    }

    // 检查是否为当前官方版本
    const logicalDoc = await db
      .select()
      .from(logicalDocuments)
      .where(eq(logicalDocuments.currentOfficialVersionId, input.id))
      .limit(1)

    if (logicalDoc.length > 0) {
      // 清除官方版本引用
      await db
        .update(logicalDocuments)
        .set({
          currentOfficialVersionId: null,
          updatedAt: new Date()
        })
        .where(eq(logicalDocuments.id, logicalDoc[0].id))
    }

    // 删除版本记录
    await db.delete(documentVersions).where(eq(documentVersions.id, input.id))

    console.log(`文档版本 "${version[0].versionTag}" 删除成功`)
    return { success: true }
  }

  /**
   * 复制文档版本
   */
  static async duplicateDocumentVersion(versionId: string, newVersionTag: string) {
    const originalVersion = await this.getDocumentVersion({ id: versionId })
    if (!originalVersion) {
      throw new Error('原版本不存在')
    }

    // 创建新版本（使用相同的文件）
    const newVersion = await this.createDocumentVersion({
      logicalDocumentId: originalVersion.logicalDocumentId,
      managedFileId: originalVersion.managedFileId,
      versionTag: newVersionTag,
      isGenericVersion: originalVersion.isGenericVersion,
      competitionMilestoneId: originalVersion.competitionMilestoneId || undefined,
      competitionProjectName: originalVersion.competitionProjectName || undefined,
      notes: `复制自版本: ${originalVersion.versionTag}`
    })

    console.log(`文档版本 "${newVersionTag}" 复制成功`)
    return newVersion
  }

  /**
   * 获取版本统计信息
   */
  static async getVersionStats(logicalDocumentId: string) {
    const versions = await this.getLogicalDocumentVersions({ logicalDocumentId })

    const stats = {
      totalVersions: versions.length,
      genericVersions: versions.filter((v) => v.isGenericVersion).length,
      competitionVersions: versions.filter((v) => !v.isGenericVersion && v.competitionMilestoneId)
        .length,
      latestVersion: versions[0] || null,
      totalFileSize: versions.reduce((sum, v) => sum + (v.fileSizeBytes || 0), 0)
    }

    return stats
  }

  /**
   * 按文件类型分组版本
   */
  static async getVersionsByFileType(logicalDocumentId: string) {
    const versions = await this.getLogicalDocumentVersions({ logicalDocumentId })

    const groupedByType = versions.reduce(
      (groups, version) => {
        const mimeType = version.mimeType || 'unknown'
        if (!groups[mimeType]) {
          groups[mimeType] = []
        }
        groups[mimeType].push(version)
        return groups
      },
      {} as Record<string, typeof versions>
    )

    return groupedByType
  }
}
