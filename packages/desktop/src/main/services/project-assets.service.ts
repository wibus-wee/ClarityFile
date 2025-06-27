import { db } from '../db'
import { projectAssets, managedFiles } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import {
  validateCreateProjectAsset,
  validateUpdateProjectAsset,
  validateGetProjectAsset,
  validateDeleteProjectAsset,
  validateGetProjectAssets,
  validateBatchDeleteProjectAssets,
  validateSearchProjectAssets
} from '../types/asset-schemas'
import type {
  CreateProjectAssetInput,
  UpdateProjectAssetInput,
  GetProjectAssetInput,
  DeleteProjectAssetInput,
  GetProjectAssetsInput,
  BatchDeleteProjectAssetsInput,
  SearchProjectAssetsInput,
  ProjectAssetStatsOutput
} from '../types/asset-schemas'
import { SuccessResponse } from '../types/outputs'

/**
 * 项目资产服务
 * 负责项目资产的CRUD操作和业务逻辑
 */
export class ProjectAssetsService {
  /**
   * 获取项目的所有资产
   */
  static async getProjectAssets(input: GetProjectAssetsInput) {
    const validatedInput = validateGetProjectAssets(input)
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
      .where(eq(projectAssets.projectId, validatedInput.projectId))
      .orderBy(desc(projectAssets.createdAt))

    return assets.map((asset) => ({
      ...asset,
      customFields: asset.customFields as Record<string, any> | null
    }))
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

    const result = coverAssetResult[0]
    if (!result) {
      return null
    }

    return {
      ...result,
      customFields: result.customFields as Record<string, any> | null
    }
  }

  /**
   * 创建项目资产
   */
  static async createProjectAsset(input: CreateProjectAssetInput) {
    const validatedInput = validateCreateProjectAsset(input)
    const result = await db
      .insert(projectAssets)
      .values({
        projectId: validatedInput.projectId,
        name: validatedInput.name,
        assetType: validatedInput.assetType,
        managedFileId: validatedInput.managedFileId,
        contextDescription: validatedInput.contextDescription,
        versionInfo: validatedInput.versionInfo,
        customFields: validatedInput.customFields
      })
      .returning()

    console.log(`项目资产 "${validatedInput.name}" 创建成功`)
    return result[0]
  }

  /**
   * 更新项目资产
   */
  static async updateProjectAsset(input: UpdateProjectAssetInput) {
    const validatedInput = validateUpdateProjectAsset(input)
    const result = await db
      .update(projectAssets)
      .set({
        name: validatedInput.name,
        assetType: validatedInput.assetType,
        contextDescription: validatedInput.contextDescription,
        versionInfo: validatedInput.versionInfo,
        customFields: validatedInput.customFields,
        updatedAt: new Date()
      })
      .where(eq(projectAssets.id, validatedInput.id))
      .returning()

    console.log(`项目资产 "${validatedInput.id}" 更新成功`)
    return result[0]
  }

  /**
   * 删除项目资产
   */
  static async deleteProjectAsset(input: DeleteProjectAssetInput): Promise<SuccessResponse> {
    const validatedInput = validateDeleteProjectAsset(input)

    await db.delete(projectAssets).where(eq(projectAssets.id, validatedInput.id)).returning()

    console.log(`项目资产 "${validatedInput.id}" 删除成功`)
    return { success: true }
  }

  /**
   * 获取项目资产统计信息
   */
  static async getProjectAssetsStatistics(
    input: GetProjectAssetsInput
  ): Promise<ProjectAssetStatsOutput> {
    const validatedInput = validateGetProjectAssets(input)
    const assets = await this.getProjectAssets(validatedInput)

    // 计算最近7天创建的资产数量
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentAssets = assets.filter((asset) => new Date(asset.createdAt) > sevenDaysAgo).length

    // 计算总文件大小
    const totalFileSize = assets.reduce((total, asset) => total + (asset.fileSizeBytes || 0), 0)

    return {
      totalAssets: assets.length,
      assetsByType: assets.reduce(
        (acc, asset) => {
          acc[asset.assetType] = (acc[asset.assetType] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      totalFileSize,
      recentAssets
    }
  }

  /**
   * 获取单个项目资产
   */
  static async getProjectAsset(input: GetProjectAssetInput) {
    const validatedInput = validateGetProjectAsset(input)

    const result = await db
      .select({
        id: projectAssets.id,
        projectId: projectAssets.projectId,
        name: projectAssets.name,
        assetType: projectAssets.assetType,
        contextDescription: projectAssets.contextDescription,
        versionInfo: projectAssets.versionInfo,
        customFields: projectAssets.customFields,
        createdAt: projectAssets.createdAt,
        updatedAt: projectAssets.updatedAt,
        // 文件信息
        managedFileId: managedFiles.id,
        fileName: managedFiles.name,
        originalFileName: managedFiles.originalFileName,
        physicalPath: managedFiles.physicalPath,
        mimeType: managedFiles.mimeType,
        fileSizeBytes: managedFiles.fileSizeBytes,
        uploadedAt: managedFiles.uploadedAt
      })
      .from(projectAssets)
      .innerJoin(managedFiles, eq(projectAssets.managedFileId, managedFiles.id))
      .where(eq(projectAssets.id, validatedInput.id))
      .limit(1)

    return result[0] || null
  }

  /**
   * 批量删除项目资产
   */
  static async batchDeleteProjectAssets(
    input: BatchDeleteProjectAssetsInput
  ): Promise<SuccessResponse> {
    const validatedInput = validateBatchDeleteProjectAssets(input)

    for (const assetId of validatedInput.assetIds) {
      await db.delete(projectAssets).where(eq(projectAssets.id, assetId))
    }

    console.log(`批量删除 ${validatedInput.assetIds.length} 个项目资产成功`)
    return {
      success: true
    }
  }

  /**
   * 搜索项目资产
   */
  static async searchProjectAssets(input: SearchProjectAssetsInput) {
    const validatedInput = validateSearchProjectAssets(input)

    // 这里可以实现更复杂的搜索逻辑
    const assets = await this.getProjectAssets({ projectId: validatedInput.projectId })

    return assets.filter((asset) => {
      const matchesQuery =
        asset.name.toLowerCase().includes(validatedInput.query.toLowerCase()) ||
        (asset.contextDescription &&
          asset.contextDescription.toLowerCase().includes(validatedInput.query.toLowerCase()))

      const matchesType = !validatedInput.assetType || asset.assetType === validatedInput.assetType

      return matchesQuery && matchesType
    })
  }
}
