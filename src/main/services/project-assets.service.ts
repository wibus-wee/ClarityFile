import { db } from '../db'
import { projectAssets, managedFiles } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import type { GetProjectInput } from '../types/inputs'

/**
 * 项目资产服务
 * 负责项目资产的CRUD操作和业务逻辑
 */
export class ProjectAssetsService {
  /**
   * 获取项目的所有资产
   */
  static async getProjectAssets(projectId: string) {
    const assets = await db
      .select({
        id: projectAssets.id,
        name: projectAssets.name,
        assetType: projectAssets.assetType,
        contextDescription: projectAssets.contextDescription,
        versionInfo: projectAssets.versionInfo,
        customFields: projectAssets.customFields,
        createdAt: projectAssets.createdAt,
        updatedAt: projectAssets.updatedAt,
        // 文件信息
        fileName: managedFiles.name,
        originalFileName: managedFiles.originalFileName,
        physicalPath: managedFiles.physicalPath,
        mimeType: managedFiles.mimeType,
        fileSizeBytes: managedFiles.fileSizeBytes,
        uploadedAt: managedFiles.uploadedAt
      })
      .from(projectAssets)
      .innerJoin(managedFiles, eq(projectAssets.managedFileId, managedFiles.id))
      .where(eq(projectAssets.projectId, projectId))
      .orderBy(desc(projectAssets.createdAt))

    return assets
  }

  /**
   * 获取项目封面资产
   */
  static async getProjectCoverAsset(coverAssetId: string | null) {
    if (!coverAssetId) {
      return null
    }

    const coverAssetResult = await db
      .select({
        id: projectAssets.id,
        name: projectAssets.name,
        assetType: projectAssets.assetType,
        contextDescription: projectAssets.contextDescription,
        versionInfo: projectAssets.versionInfo,
        customFields: projectAssets.customFields,
        createdAt: projectAssets.createdAt,
        updatedAt: projectAssets.updatedAt,
        // 文件信息
        fileName: managedFiles.name,
        originalFileName: managedFiles.originalFileName,
        physicalPath: managedFiles.physicalPath,
        mimeType: managedFiles.mimeType,
        fileSizeBytes: managedFiles.fileSizeBytes,
        uploadedAt: managedFiles.uploadedAt
      })
      .from(projectAssets)
      .innerJoin(managedFiles, eq(projectAssets.managedFileId, managedFiles.id))
      .where(eq(projectAssets.id, coverAssetId))
      .limit(1)

    return coverAssetResult[0] || null
  }

  /**
   * 创建项目资产
   */
  static async createProjectAsset(input: {
    projectId: string
    name: string
    assetType: string
    managedFileId: string
    contextDescription?: string
    versionInfo?: string
    customFields?: unknown
  }) {
    const result = await db
      .insert(projectAssets)
      .values({
        projectId: input.projectId,
        name: input.name,
        assetType: input.assetType,
        managedFileId: input.managedFileId,
        contextDescription: input.contextDescription,
        versionInfo: input.versionInfo,
        customFields: input.customFields
      })
      .returning()

    console.log(`项目资产 "${input.name}" 创建成功`)
    return result[0]
  }

  /**
   * 更新项目资产
   */
  static async updateProjectAsset(input: {
    id: string
    name?: string
    assetType?: string
    contextDescription?: string
    versionInfo?: string
    customFields?: unknown
  }) {
    const result = await db
      .update(projectAssets)
      .set({
        name: input.name,
        assetType: input.assetType,
        contextDescription: input.contextDescription,
        versionInfo: input.versionInfo,
        customFields: input.customFields,
        updatedAt: new Date()
      })
      .where(eq(projectAssets.id, input.id))
      .returning()

    console.log(`项目资产 "${input.id}" 更新成功`)
    return result[0]
  }

  /**
   * 删除项目资产
   */
  static async deleteProjectAsset(id: string) {
    const result = await db
      .delete(projectAssets)
      .where(eq(projectAssets.id, id))
      .returning()

    console.log(`项目资产 "${id}" 删除成功`)
    return { success: true }
  }

  /**
   * 获取项目资产统计信息
   */
  static async getProjectAssetsStatistics(projectId: string) {
    const assets = await this.getProjectAssets(projectId)
    
    return {
      assetCount: assets.length,
      assetsByType: assets.reduce((acc, asset) => {
        acc[asset.assetType] = (acc[asset.assetType] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }
}
