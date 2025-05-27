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
    // 首先在数据库中创建项目记录
    const result = await db
      .insert(projects)
      .values({
        name: input.name,
        description: input.description,
        status: input.status || 'active'
      })
      .returning()

    const project = result[0]

    // 创建项目文件夹
    try {
      await ProjectFolderService.createProjectFolder(project.name, project.id)
      console.log(`项目 "${project.name}" 创建成功，文件夹已创建`)
    } catch (error) {
      console.error(`项目 "${project.name}" 文件夹创建失败:`, error)
      // 注意：这里我们不抛出错误，因为项目记录已经创建成功
      // 文件夹创建失败不应该影响项目的创建
      // 可以在后续提供手动创建文件夹的功能
    }

    return project
  }

  // 更新项目
  static async updateProject(input: UpdateProjectInput) {
    const { id, ...updateData } = input
    const result = await db
      .update(projects)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(projects.id, id))
      .returning()
    return result[0]
  }

  // 删除项目
  static async deleteProject(input: DeleteProjectInput): Promise<SuccessResponse> {
    await db.delete(projects).where(eq(projects.id, input.id))
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
}
