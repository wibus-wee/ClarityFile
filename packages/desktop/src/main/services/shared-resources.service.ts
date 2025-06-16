import { db } from '../db'
import { sharedResources, projectSharedResources, managedFiles } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

/**
 * 共享资源服务
 * 负责共享资源的CRUD操作和业务逻辑
 */
export class SharedResourcesService {
  /**
   * 获取项目关联的共享资源
   */
  static async getProjectSharedResources(projectId: string) {
    const sharedResourcesData = await db
      .select({
        // 关联信息
        usageDescription: projectSharedResources.usageDescription,
        associatedAt: projectSharedResources.createdAt,
        // 共享资源信息
        resourceId: sharedResources.id,
        resourceName: sharedResources.name,
        resourceType: sharedResources.type,
        resourceDescription: sharedResources.description,
        resourceCustomFields: sharedResources.customFields,
        resourceCreatedAt: sharedResources.createdAt,
        resourceUpdatedAt: sharedResources.updatedAt,
        // 文件信息
        fileName: managedFiles.name,
        originalFileName: managedFiles.originalFileName,
        physicalPath: managedFiles.physicalPath,
        mimeType: managedFiles.mimeType,
        fileSizeBytes: managedFiles.fileSizeBytes,
        uploadedAt: managedFiles.uploadedAt
      })
      .from(projectSharedResources)
      .innerJoin(sharedResources, eq(projectSharedResources.sharedResourceId, sharedResources.id))
      .innerJoin(managedFiles, eq(sharedResources.managedFileId, managedFiles.id))
      .where(eq(projectSharedResources.projectId, projectId))
      .orderBy(desc(projectSharedResources.createdAt))

    return sharedResourcesData.map((resource) => ({
      ...resource,
      resourceCustomFields: resource.resourceCustomFields as Record<string, any> | null
    }))
  }

  /**
   * 获取所有共享资源
   */
  static async getAllSharedResources() {
    const resources = await db
      .select({
        id: sharedResources.id,
        name: sharedResources.name,
        type: sharedResources.type,
        description: sharedResources.description,
        customFields: sharedResources.customFields,
        createdAt: sharedResources.createdAt,
        updatedAt: sharedResources.updatedAt,
        // 文件信息
        fileName: managedFiles.name,
        originalFileName: managedFiles.originalFileName,
        physicalPath: managedFiles.physicalPath,
        mimeType: managedFiles.mimeType,
        fileSizeBytes: managedFiles.fileSizeBytes,
        uploadedAt: managedFiles.uploadedAt
      })
      .from(sharedResources)
      .innerJoin(managedFiles, eq(sharedResources.managedFileId, managedFiles.id))
      .orderBy(desc(sharedResources.createdAt))

    return resources
  }

  /**
   * 创建共享资源
   */
  static async createSharedResource(input: {
    name: string
    type: string
    managedFileId: string
    description?: string
    customFields?: unknown
  }) {
    const result = await db
      .insert(sharedResources)
      .values({
        name: input.name,
        type: input.type,
        managedFileId: input.managedFileId,
        description: input.description,
        customFields: input.customFields
      })
      .returning()

    console.log(`共享资源 "${input.name}" 创建成功`)
    return result[0]
  }

  /**
   * 更新共享资源
   */
  static async updateSharedResource(input: {
    id: string
    name?: string
    type?: string
    description?: string
    customFields?: unknown
  }) {
    const result = await db
      .update(sharedResources)
      .set({
        name: input.name,
        type: input.type,
        description: input.description,
        customFields: input.customFields,
        updatedAt: new Date()
      })
      .where(eq(sharedResources.id, input.id))
      .returning()

    console.log(`共享资源 "${input.id}" 更新成功`)
    return result[0]
  }

  /**
   * 删除共享资源
   */
  static async deleteSharedResource(id: string) {
    // 先删除项目关联
    await db.delete(projectSharedResources).where(eq(projectSharedResources.sharedResourceId, id))

    // 再删除共享资源本身
    await db.delete(sharedResources).where(eq(sharedResources.id, id)).returning()

    console.log(`共享资源 "${id}" 删除成功`)
    return { success: true }
  }

  /**
   * 将共享资源关联到项目
   */
  static async associateResourceToProject(input: {
    projectId: string
    sharedResourceId: string
    usageDescription?: string
  }) {
    const result = await db
      .insert(projectSharedResources)
      .values({
        projectId: input.projectId,
        sharedResourceId: input.sharedResourceId,
        usageDescription: input.usageDescription
      })
      .returning()

    console.log(`共享资源已关联到项目`)
    return result[0]
  }

  /**
   * 取消共享资源与项目的关联
   */
  static async disassociateResourceFromProject(input: {
    projectId: string
    sharedResourceId: string
  }) {
    await db
      .delete(projectSharedResources)
      .where(
        eq(projectSharedResources.projectId, input.projectId) &&
          eq(projectSharedResources.sharedResourceId, input.sharedResourceId)
      )
      .returning()

    console.log(`共享资源已从项目中取消关联`)
    return { success: true }
  }

  /**
   * 获取共享资源统计信息
   */
  static async getSharedResourcesStatistics() {
    const resources = await this.getAllSharedResources()

    const typeBreakdown = resources.reduce(
      (acc, resource) => {
        acc[resource.type] = (acc[resource.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      totalCount: resources.length,
      typeBreakdown
    }
  }

  /**
   * 根据类型获取共享资源
   */
  static async getSharedResourcesByType(type: string) {
    const resources = await db
      .select()
      .from(sharedResources)
      .innerJoin(managedFiles, eq(sharedResources.managedFileId, managedFiles.id))
      .where(eq(sharedResources.type, type))
      .orderBy(desc(sharedResources.createdAt))

    return resources
  }
}
