import { db } from '../db'
import {
  projects,
  logicalDocuments,
  documentVersions,
  managedFiles,
  projectAssets,
  expenseTrackings,
  projectSharedResources,
  sharedResources,
  projectCompetitionMilestones,
  competitionMilestones,
  competitionSeries,
  projectTags,
  tags
} from '../../db/schema'
import { eq, desc, like, and } from 'drizzle-orm'
import type {
  CreateProjectInput,
  UpdateProjectInput,
  GetProjectInput,
  DeleteProjectInput,
  SearchProjectsInput
} from '../types/inputs'
import type { SuccessResponse, ProjectDetailsOutput } from '../types/outputs'
import { ProjectFolderManager } from '../managers/project-folder.manager'
import { PathSyncManager } from '../managers/path-sync.manager'

export class ProjectService {
  // 获取所有项目
  static async getProjects() {
    const result = await db.select().from(projects).orderBy(desc(projects.updatedAt))
    return result
  }

  // 根据 ID 获取项目
  static async getProject(input: GetProjectInput) {
    const result = await db.select().from(projects).where(eq(projects.id, input.id)).limit(1)
    return result[0] || null
  }

  // 创建项目
  static async createProject(input: CreateProjectInput) {
    // 首先在数据库中创建项目记录（不包含文件夹路径）
    const result = await db
      .insert(projects)
      .values({
        name: input.name,
        description: input.description,
        status: input.status || 'active'
      })
      .returning()

    const project = result[0]

    // 创建项目文件夹并同步路径到数据库
    try {
      const folderPath = await ProjectFolderManager.createProjectFolder(project.name, project.id)

      // 更新数据库中的文件夹路径
      await db
        .update(projects)
        .set({
          folderPath: folderPath,
          updatedAt: new Date()
        })
        .where(eq(projects.id, project.id))

      console.log(`项目 "${project.name}" 创建成功，文件夹已创建并同步路径: ${folderPath}`)

      // 返回包含路径的完整项目信息
      return { ...project, folderPath }
    } catch (error) {
      console.error(`项目 "${project.name}" 文件夹创建失败:`, error)
      // 注意：这里我们不抛出错误，因为项目记录已经创建成功
      // 文件夹创建失败不应该影响项目的创建
      // 可以在后续提供手动创建文件夹的功能
      return project
    }
  }

  // 更新项目
  static async updateProject(input: UpdateProjectInput) {
    const { id, ...updateData } = input

    // 如果更新了项目名称，需要处理文件夹重命名
    let oldProject: any = null
    if (updateData.name) {
      // 获取旧的项目信息
      const oldProjectResult = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
      oldProject = oldProjectResult[0] || null
    }

    // 更新数据库记录
    const result = await db
      .update(projects)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(projects.id, id))
      .returning()

    const updatedProject = result[0]

    // 如果项目名称发生了变化，重命名文件夹并同步路径
    if (oldProject && updateData.name && oldProject.name !== updateData.name) {
      try {
        const newFolderPath = await ProjectFolderManager.renameProjectFolder(
          oldProject.name,
          updateData.name,
          id
        )

        // 更新数据库中的文件夹路径
        await db
          .update(projects)
          .set({
            folderPath: newFolderPath,
            updatedAt: new Date()
          })
          .where(eq(projects.id, id))

        console.log(
          `项目 "${oldProject.name}" 重命名为 "${updateData.name}"，文件夹已更新并同步路径: ${newFolderPath}`
        )

        // 返回包含新路径的项目信息
        return { ...updatedProject, folderPath: newFolderPath }
      } catch (error) {
        console.error(`项目文件夹重命名失败:`, error)
        // 注意：这里我们不抛出错误，因为数据库记录已经更新成功
        // 文件夹重命名失败不应该影响项目的更新
      }
    }

    return updatedProject
  }

  // 删除项目
  static async deleteProject(input: DeleteProjectInput): Promise<SuccessResponse> {
    // 获取项目信息用于文件夹删除
    const projectResult = await db.select().from(projects).where(eq(projects.id, input.id)).limit(1)
    const project = projectResult[0]

    // 删除数据库记录
    await db.delete(projects).where(eq(projects.id, input.id))

    // 删除项目文件夹（如果项目存在）
    if (project) {
      try {
        // 默认不强制删除，只删除空文件夹
        // 如果需要强制删除，可以传入 true
        await ProjectFolderManager.deleteProjectFolder(project.name, project.id, false)
        console.log(`项目 "${project.name}" 删除成功，空文件夹已清理`)
      } catch (error) {
        console.error(`项目文件夹删除失败:`, error)
        // 注意：这里我们不抛出错误，因为数据库记录已经删除成功
        // 文件夹删除失败不应该影响项目的删除
      }
    }

    return { success: true }
  }

  // 搜索项目
  static async searchProjects(input: SearchProjectsInput) {
    const result = await db
      .select()
      .from(projects)
      .where(and(like(projects.name, `%${input.query}%`), eq(projects.status, 'active')))
      .orderBy(desc(projects.updatedAt))
    return result
  }

  // 同步项目文件夹路径
  static async syncProjectFolderPath(projectId: string): Promise<SuccessResponse> {
    return await PathSyncManager.syncProjectFolderPath(projectId)
  }

  // 批量同步所有项目的文件夹路径
  static async syncAllProjectFolderPaths(): Promise<SuccessResponse> {
    return await PathSyncManager.syncAllProjectFolderPaths()
  }

  // 修复项目文件夹（重新创建缺失的文件夹）
  static async repairProjectFolder(projectId: string): Promise<SuccessResponse> {
    return await PathSyncManager.repairProjectFolder(projectId)
  }

  // 获取项目详细信息（聚合所有相关数据）
  static async getProjectDetails(input: GetProjectInput): Promise<ProjectDetailsOutput | null> {
    // 1. 获取项目基本信息
    const project = await this.getProject(input)
    if (!project) {
      return null
    }

    // 2. 获取项目的逻辑文档（包含版本信息）
    const logicalDocs = await db
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
      .where(and(eq(logicalDocuments.projectId, input.id), eq(logicalDocuments.status, 'active')))
      .orderBy(desc(logicalDocuments.updatedAt))

    // 为每个逻辑文档获取版本列表
    const documentsWithVersions = await Promise.all(
      logicalDocs.map(async (doc) => {
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

    // 3. 获取项目资产
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
      .where(eq(projectAssets.projectId, input.id))
      .orderBy(desc(projectAssets.createdAt))

    // 4. 获取项目经费记录
    const expenses = await db
      .select({
        id: expenseTrackings.id,
        itemName: expenseTrackings.itemName,
        applicant: expenseTrackings.applicant,
        amount: expenseTrackings.amount,
        applicationDate: expenseTrackings.applicationDate,
        status: expenseTrackings.status,
        reimbursementDate: expenseTrackings.reimbursementDate,
        notes: expenseTrackings.notes,
        createdAt: expenseTrackings.createdAt,
        updatedAt: expenseTrackings.updatedAt,
        // 发票文件信息（可能为空）
        invoiceFileName: managedFiles.name,
        invoiceOriginalFileName: managedFiles.originalFileName,
        invoicePhysicalPath: managedFiles.physicalPath,
        invoiceMimeType: managedFiles.mimeType,
        invoiceFileSizeBytes: managedFiles.fileSizeBytes,
        invoiceUploadedAt: managedFiles.uploadedAt
      })
      .from(expenseTrackings)
      .leftJoin(managedFiles, eq(expenseTrackings.invoiceManagedFileId, managedFiles.id))
      .where(eq(expenseTrackings.projectId, input.id))
      .orderBy(desc(expenseTrackings.applicationDate))

    // 5. 获取项目关联的共享资源
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
      .where(eq(projectSharedResources.projectId, input.id))
      .orderBy(desc(projectSharedResources.createdAt))

    // 6. 获取项目参与的赛事里程碑
    const competitions = await db
      .select({
        // 项目在里程碑中的状态
        statusInMilestone: projectCompetitionMilestones.statusInMilestone,
        milestoneNotes: projectCompetitionMilestones.notes,
        participatedAt: projectCompetitionMilestones.createdAt,
        // 里程碑信息
        milestoneId: competitionMilestones.id,
        levelName: competitionMilestones.levelName,
        dueDateMilestone: competitionMilestones.dueDateMilestone,
        milestoneCreatedAt: competitionMilestones.createdAt,
        milestoneUpdatedAt: competitionMilestones.updatedAt,
        // 赛事系列信息
        seriesId: competitionSeries.id,
        seriesName: competitionSeries.name,
        seriesNotes: competitionSeries.notes,
        seriesCreatedAt: competitionSeries.createdAt,
        seriesUpdatedAt: competitionSeries.updatedAt,
        // 通知文件信息（可能为空）
        notificationFileName: managedFiles.name,
        notificationOriginalFileName: managedFiles.originalFileName,
        notificationPhysicalPath: managedFiles.physicalPath,
        notificationMimeType: managedFiles.mimeType,
        notificationFileSizeBytes: managedFiles.fileSizeBytes,
        notificationUploadedAt: managedFiles.uploadedAt
      })
      .from(projectCompetitionMilestones)
      .innerJoin(
        competitionMilestones,
        eq(projectCompetitionMilestones.competitionMilestoneId, competitionMilestones.id)
      )
      .innerJoin(
        competitionSeries,
        eq(competitionMilestones.competitionSeriesId, competitionSeries.id)
      )
      .leftJoin(managedFiles, eq(competitionMilestones.notificationManagedFileId, managedFiles.id))
      .where(eq(projectCompetitionMilestones.projectId, input.id))
      .orderBy(desc(projectCompetitionMilestones.createdAt))

    // 7. 获取项目标签
    const projectTagsData = await db
      .select({
        tagId: tags.id,
        tagName: tags.name,
        tagColor: tags.color,
        tagCreatedAt: tags.createdAt
      })
      .from(projectTags)
      .innerJoin(tags, eq(projectTags.tagId, tags.id))
      .where(eq(projectTags.projectId, input.id))
      .orderBy(tags.name)

    // 8. 获取项目封面资产信息（如果有）
    let coverAsset: any = null
    if (project.currentCoverAssetId) {
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
        .where(eq(projectAssets.id, project.currentCoverAssetId))
        .limit(1)

      coverAsset = coverAssetResult[0] || null
    }

    // 9. 组装完整的项目详情
    return {
      // 项目基本信息
      project,
      // 项目封面
      coverAsset,
      // 文档相关
      documents: documentsWithVersions,
      // 资产相关
      assets,
      // 经费相关
      expenses,
      // 共享资源相关
      sharedResources: sharedResourcesData,
      // 赛事相关
      competitions,
      // 标签相关
      tags: projectTagsData,
      // 统计信息
      statistics: {
        documentCount: documentsWithVersions.length,
        versionCount: documentsWithVersions.reduce((sum, doc) => sum + doc.versions.length, 0),
        assetCount: assets.length,
        expenseCount: expenses.length,
        totalExpenseAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
        sharedResourceCount: sharedResourcesData.length,
        competitionCount: competitions.length,
        tagCount: projectTagsData.length
      }
    }
  }
}
