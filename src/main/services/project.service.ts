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
import type { SuccessResponse } from '../types/outputs'
import { ProjectFolderService } from './project-folder.service'

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
      const folderPath = await ProjectFolderService.createProjectFolder(project.name, project.id)

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
        const newFolderPath = await ProjectFolderService.renameProjectFolder(
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
        await ProjectFolderService.deleteProjectFolder(project.name, project.id, false)
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
    try {
      // 获取项目信息
      const projectResult = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)
      const project = projectResult[0]

      if (!project) {
        throw new Error('项目不存在')
      }

      // 获取实际的文件夹路径
      const actualFolderPath = await ProjectFolderService.getProjectFolderPath(
        project.name,
        project.id
      )

      // 检查文件夹是否存在
      const folderExists = await ProjectFolderService.folderExists(actualFolderPath)

      if (folderExists) {
        // 更新数据库中的路径
        await db
          .update(projects)
          .set({
            folderPath: actualFolderPath,
            updatedAt: new Date()
          })
          .where(eq(projects.id, projectId))

        console.log(`项目 "${project.name}" 路径已同步: ${actualFolderPath}`)
      } else {
        // 文件夹不存在，清空数据库中的路径
        await db
          .update(projects)
          .set({
            folderPath: null,
            updatedAt: new Date()
          })
          .where(eq(projects.id, projectId))

        console.log(`项目 "${project.name}" 文件夹不存在，已清空路径记录`)
      }

      return { success: true }
    } catch (error) {
      console.error('同步项目文件夹路径失败:', error)
      throw new Error(
        `同步项目文件夹路径失败: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // 批量同步所有项目的文件夹路径
  static async syncAllProjectFolderPaths(): Promise<SuccessResponse> {
    try {
      const allProjects = await db.select().from(projects)
      let syncedCount = 0
      let errorCount = 0

      for (const project of allProjects) {
        try {
          await this.syncProjectFolderPath(project.id)
          syncedCount++
        } catch (error) {
          console.error(`同步项目 "${project.name}" 路径失败:`, error)
          errorCount++
        }
      }

      console.log(`批量同步完成: 成功 ${syncedCount} 个，失败 ${errorCount} 个`)
      return { success: true }
    } catch (error) {
      console.error('批量同步项目文件夹路径失败:', error)
      throw new Error(
        `批量同步项目文件夹路径失败: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // 修复项目文件夹（重新创建缺失的文件夹）
  static async repairProjectFolder(projectId: string): Promise<SuccessResponse> {
    try {
      // 获取项目信息
      const projectResult = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)
      const project = projectResult[0]

      if (!project) {
        throw new Error('项目不存在')
      }

      // 重新创建文件夹
      const folderPath = await ProjectFolderService.createProjectFolder(project.name, project.id)

      // 更新数据库中的路径
      await db
        .update(projects)
        .set({
          folderPath: folderPath,
          updatedAt: new Date()
        })
        .where(eq(projects.id, projectId))

      console.log(`项目 "${project.name}" 文件夹已修复: ${folderPath}`)
      return { success: true }
    } catch (error) {
      console.error('修复项目文件夹失败:', error)
      throw new Error(
        `修复项目文件夹失败: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
