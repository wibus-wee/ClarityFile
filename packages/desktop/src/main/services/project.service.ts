import { db } from '../db'
import {
  projects,
  managedFiles,
  projectAssets,
  logicalDocuments,
  documentVersions,
  expenseTrackings
} from '../../db/schema'
import { eq, desc, like, and, isNotNull } from 'drizzle-orm'
import {
  validateCreateProject,
  validateUpdateProject,
  validateGetProject,
  validateDeleteProject,
  validateSearchProjects,
  validateSyncProjectFolderPath,
  validateRepairProjectFolder
} from '../types/project-schemas'
import type {
  CreateProjectInput,
  UpdateProjectInput,
  GetProjectInput,
  DeleteProjectInput,
  SearchProjectsInput,
  SyncProjectFolderPathInput,
  RepairProjectFolderInput,
  ProjectDetailsOutput,
  ProjectStatus
} from '../types/project-schemas'
import { SuccessResponse } from '../types/outputs'
import { ProjectFolderManager } from '../managers/project-folder.manager'
import { PathSyncManager } from '../managers/path-sync.manager'
// 导入专门的服务类
import { LogicalDocumentService } from './document/logical-document.service'
import { ProjectAssetsService } from './project-assets.service'
import { ExpenseTrackingService } from './expense-tracking.service'
import { BudgetPoolService } from './budget-pool.service'

import { CompetitionService } from './competition.service'
import { TagService } from './tag.service'

export class ProjectService {
  /**
   * 更新项目相关的所有受管文件的物理路径
   * 当项目文件夹重命名后，更新数据库中所有相关文件的路径记录
   */
  private static async updateProjectManagedFilesPath(
    projectId: string,
    oldFolderPath: string,
    newFolderPath: string
  ): Promise<void> {
    try {
      console.log(`开始更新项目 ${projectId} 的文件路径: ${oldFolderPath} -> ${newFolderPath}`)

      // 1. 获取项目资产关联的所有文件ID
      const assetFiles = await db
        .select({
          managedFileId: projectAssets.managedFileId
        })
        .from(projectAssets)
        .where(eq(projectAssets.projectId, projectId))

      // 2. 获取项目文档关联的所有文件ID
      const documentFiles = await db
        .select({
          managedFileId: documentVersions.managedFileId
        })
        .from(documentVersions)
        .innerJoin(logicalDocuments, eq(documentVersions.logicalDocumentId, logicalDocuments.id))
        .where(eq(logicalDocuments.projectId, projectId))

      // 3. 获取项目经费管理关联的所有文件ID（发票等）
      const expenseFiles = await db
        .select({
          managedFileId: expenseTrackings.invoiceManagedFileId
        })
        .from(expenseTrackings)
        .where(
          and(
            eq(expenseTrackings.projectId, projectId),
            isNotNull(expenseTrackings.invoiceManagedFileId)
          )
        )

      // 4. 合并所有文件ID并去重
      const allManagedFileIds = new Set<string>()

      assetFiles.forEach((file) => {
        if (file.managedFileId) {
          allManagedFileIds.add(file.managedFileId)
        }
      })

      documentFiles.forEach((file) => {
        if (file.managedFileId) {
          allManagedFileIds.add(file.managedFileId)
        }
      })

      expenseFiles.forEach((file) => {
        if (file.managedFileId) {
          allManagedFileIds.add(file.managedFileId)
        }
      })

      console.log(`找到 ${allManagedFileIds.size} 个需要更新路径的文件`)

      // 5. 更新每个文件的路径
      let updatedCount = 0
      for (const fileId of allManagedFileIds) {
        // 获取当前文件信息
        const fileResult = await db
          .select()
          .from(managedFiles)
          .where(eq(managedFiles.id, fileId))
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
              .where(eq(managedFiles.id, fileId))

            console.log(`文件路径已更新: ${file.physicalPath} -> ${newPhysicalPath}`)
            updatedCount++
          }
        }
      }

      console.log(`项目 ${projectId} 的文件路径更新完成，共更新了 ${updatedCount} 个文件`)
    } catch (error) {
      console.error('更新项目受管文件路径失败:', error)
      throw error
    }
  }

  // 获取所有项目
  static async getProjects() {
    const result = await db.select().from(projects).orderBy(desc(projects.updatedAt))

    // 为每个项目获取封面资产信息
    const projectsWithCovers = await Promise.all(
      result.map(async (project) => {
        const coverAsset = project.currentCoverAssetId
          ? await ProjectAssetsService.getProjectCoverAsset(project.currentCoverAssetId)
          : null

        return {
          ...project,
          coverAsset
        }
      })
    )

    return projectsWithCovers
  }

  // 根据 ID 获取项目
  static async getProject(input: GetProjectInput) {
    const validatedInput = validateGetProject(input)
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, validatedInput.id))
      .limit(1)
    return result[0] || null
  }

  // 创建项目
  static async createProject(input: CreateProjectInput) {
    const validatedInput = validateCreateProject(input)

    // 首先在数据库中创建项目记录（不包含文件夹路径）
    const result = await db
      .insert(projects)
      .values({
        name: validatedInput.name,
        description: validatedInput.description,
        status: validatedInput.status || 'active'
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
    const validatedInput = validateUpdateProject(input)
    const { id, ...updateData } = validatedInput

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

        // 更新项目相关的所有受管文件的路径
        try {
          const oldFolderPath = oldProject.folderPath
          if (oldFolderPath) {
            await this.updateProjectManagedFilesPath(id, oldFolderPath, newFolderPath)
            console.log(`项目 "${updateData.name}" 的所有文件路径已同步更新`)
          }
        } catch (pathUpdateError) {
          console.error('更新项目文件路径失败:', pathUpdateError)
          // 注意：这里我们不抛出错误，因为文件夹重命名已经成功
          // 路径更新失败不应该影响项目的更新，可以后续手动修复
        }

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
    const validatedInput = validateDeleteProject(input)

    // 获取项目信息用于文件夹删除
    const projectResult = await db
      .select()
      .from(projects)
      .where(eq(projects.id, validatedInput.id))
      .limit(1)
    const project = projectResult[0]

    // 删除数据库记录
    await db.delete(projects).where(eq(projects.id, validatedInput.id))

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
    const validatedInput = validateSearchProjects(input)
    const result = await db
      .select()
      .from(projects)
      .where(and(like(projects.name, `%${validatedInput.query}%`), eq(projects.status, 'active')))
      .orderBy(desc(projects.updatedAt))
    return result
  }

  // 同步项目文件夹路径
  static async syncProjectFolderPath(input: SyncProjectFolderPathInput): Promise<SuccessResponse> {
    const validatedInput = validateSyncProjectFolderPath(input)
    return await PathSyncManager.syncProjectFolderPath(validatedInput.projectId)
  }

  // 批量同步所有项目的文件夹路径
  static async syncAllProjectFolderPaths(): Promise<SuccessResponse> {
    return await PathSyncManager.syncAllProjectFolderPaths()
  }

  // 修复项目文件夹（重新创建缺失的文件夹）
  static async repairProjectFolder(input: RepairProjectFolderInput): Promise<SuccessResponse> {
    const validatedInput = validateRepairProjectFolder(input)
    return await PathSyncManager.repairProjectFolder(validatedInput.projectId)
  }

  // 获取项目详细信息（聚合所有相关数据）
  static async getProjectDetails(input: GetProjectInput): Promise<ProjectDetailsOutput | null> {
    const validatedInput = validateGetProject(input)

    // 1. 获取项目基本信息
    const project = await this.getProject(validatedInput)
    if (!project) {
      return null
    }

    // 2. 并行获取所有关联数据，委托给专门的服务类
    const [
      documentsWithVersions,
      assets,
      expenses,
      budgetOverview,
      competitions,
      projectTagsData,
      coverAsset
    ] = await Promise.all([
      LogicalDocumentService.getProjectDocumentsWithVersions(validatedInput.id),
      ProjectAssetsService.getProjectAssets({ projectId: validatedInput.id }),
      ExpenseTrackingService.getProjectExpenses(validatedInput.id),
      BudgetPoolService.getProjectBudgetOverview(validatedInput.id),
      CompetitionService.getProjectCompetitions(validatedInput.id),
      TagService.getProjectTags(validatedInput.id),
      project.currentCoverAssetId
        ? ProjectAssetsService.getProjectCoverAsset(project.currentCoverAssetId)
        : Promise.resolve(null)
    ]).catch((error) => {
      console.error('获取项目详情失败:', error)
      throw new Error(`获取项目详情失败: ${error instanceof Error ? error.message : String(error)}`)
    })

    // 3. 组装完整的项目详情
    return {
      // 项目基本信息
      project: {
        ...project,
        status: project.status as ProjectStatus
      },
      // 项目封面
      coverAsset,
      // 文档相关
      documents: documentsWithVersions,
      // 资产相关
      assets,
      // 经费相关
      expenses,
      // 经费池相关
      budgetOverview,
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
        // 使用经费池概览中的正确数据
        totalBudget: budgetOverview.totalBudget, // 项目总预算（所有经费池预算之和）
        usedBudget: budgetOverview.usedBudget, // 实际已使用预算
        remainingBudget: budgetOverview.remainingBudget, // 剩余预算
        budgetUtilizationRate: budgetOverview.utilizationRate, // 预算使用率
        budgetPoolCount: budgetOverview.budgetPools.length, // 经费池数量

        competitionCount: competitions.length,
        tagCount: projectTagsData.length
      }
    }
  }
}
