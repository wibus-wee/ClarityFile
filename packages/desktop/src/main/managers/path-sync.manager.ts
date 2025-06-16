import { db } from '../db'
import { projects } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { ProjectFolderManager } from './project-folder.manager'
import { FilesystemOperations } from '../utils/filesystem-operations'
import type { SuccessResponse } from '../types/outputs'

/**
 * 路径同步管理器
 * 负责数据库与文件系统路径的同步
 */
export class PathSyncManager {
  /**
   * 同步单个项目的文件夹路径
   * @param projectId 项目ID
   * @returns 操作结果
   */
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
      const actualFolderPath = await ProjectFolderManager.getProjectFolderPath(
        project.name,
        project.id
      )

      // 检查文件夹是否存在
      const folderExists = await FilesystemOperations.folderExists(actualFolderPath)

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

  /**
   * 批量同步所有项目的文件夹路径
   * @returns 操作结果
   */
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

  /**
   * 修复项目文件夹（重新创建缺失的文件夹）
   * @param projectId 项目ID
   * @returns 操作结果
   */
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
      const folderPath = await ProjectFolderManager.createProjectFolder(project.name, project.id)

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

  /**
   * 验证项目路径的一致性
   * @param projectId 项目ID
   * @returns 验证结果
   */
  static async validateProjectPath(projectId: string): Promise<{
    isConsistent: boolean
    databasePath: string | null
    actualPath: string
    folderExists: boolean
  }> {
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

      // 获取数据库中的路径
      const databasePath = project.folderPath

      // 获取实际应该的路径
      const actualPath = await ProjectFolderManager.getProjectFolderPath(project.name, project.id)

      // 检查文件夹是否存在
      const folderExists = await FilesystemOperations.folderExists(actualPath)

      // 检查一致性
      const isConsistent = databasePath === actualPath && folderExists

      return {
        isConsistent,
        databasePath,
        actualPath,
        folderExists
      }
    } catch (error) {
      console.error('验证项目路径失败:', error)
      throw new Error(`验证项目路径失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 获取所有路径不一致的项目
   * @returns 不一致的项目列表
   */
  static async getInconsistentProjects(): Promise<
    Array<{
      projectId: string
      projectName: string
      databasePath: string | null
      actualPath: string
      folderExists: boolean
    }>
  > {
    try {
      const allProjects = await db.select().from(projects)
      const inconsistentProjects: Array<{
        projectId: string
        projectName: string
        databasePath: string | null
        actualPath: string
        folderExists: boolean
      }> = []

      for (const project of allProjects) {
        const validation = await this.validateProjectPath(project.id)
        if (!validation.isConsistent) {
          inconsistentProjects.push({
            projectId: project.id,
            projectName: project.name,
            databasePath: validation.databasePath,
            actualPath: validation.actualPath,
            folderExists: validation.folderExists
          })
        }
      }

      return inconsistentProjects
    } catch (error) {
      console.error('获取不一致项目失败:', error)
      throw new Error(
        `获取不一致项目失败: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * 自动修复所有路径不一致的项目
   * @returns 修复结果
   */
  static async autoRepairInconsistentProjects(): Promise<{
    totalInconsistent: number
    repaired: number
    failed: number
  }> {
    try {
      const inconsistentProjects = await this.getInconsistentProjects()
      let repaired = 0
      let failed = 0

      for (const project of inconsistentProjects) {
        try {
          if (project.folderExists) {
            // 文件夹存在但路径不一致，同步路径
            await this.syncProjectFolderPath(project.projectId)
          } else {
            // 文件夹不存在，修复文件夹
            await this.repairProjectFolder(project.projectId)
          }
          repaired++
        } catch (error) {
          console.error(`修复项目 "${project.projectName}" 失败:`, error)
          failed++
        }
      }

      console.log(
        `自动修复完成: 总计 ${inconsistentProjects.length} 个不一致项目，修复 ${repaired} 个，失败 ${failed} 个`
      )

      return {
        totalInconsistent: inconsistentProjects.length,
        repaired,
        failed
      }
    } catch (error) {
      console.error('自动修复不一致项目失败:', error)
      throw new Error(
        `自动修复不一致项目失败: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
