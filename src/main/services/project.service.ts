import { db } from '../db'
import { projects } from '../../db/schema'
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
// 导入专门的服务类
import { LogicalDocumentService } from './document/logical-document.service'
import { ProjectAssetsService } from './project-assets.service'
import { ExpenseTrackingService } from './expense-tracking.service'
import { SharedResourcesService } from './shared-resources.service'
import { CompetitionService } from './competition.service'
import { TagService } from './tag.service'

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

    // 2. 并行获取所有关联数据，委托给专门的服务类
    const [
      documentsWithVersions,
      assets,
      expenses,
      sharedResourcesData,
      competitions,
      projectTagsData,
      coverAsset
    ] = await Promise.all([
      LogicalDocumentService.getProjectDocumentsWithVersions(input.id),
      ProjectAssetsService.getProjectAssets(input.id),
      ExpenseTrackingService.getProjectExpenses(input.id),
      SharedResourcesService.getProjectSharedResources(input.id),
      CompetitionService.getProjectCompetitions(input.id),
      TagService.getProjectTags(input.id),
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
