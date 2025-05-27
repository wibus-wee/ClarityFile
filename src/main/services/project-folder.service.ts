import { ProjectFolderManager } from '../managers/project-folder.manager'
import { FilesystemOperations } from '../utils/filesystem-operations'

/**
 * 项目文件夹服务
 * 提供项目文件夹操作的统一接口，委托给相应的管理器
 * @deprecated 建议直接使用 ProjectFolderManager 和相关工具类
 */
export class ProjectFolderService {
  /**
   * 创建项目文件夹结构
   * @param projectName 项目名称
   * @param projectId 项目ID
   * @returns 创建的项目文件夹路径
   */
  static async createProjectFolder(projectName: string, projectId: string): Promise<string> {
    return await ProjectFolderManager.createProjectFolder(projectName, projectId)
  }

  /**
   * 检查文件夹是否存在
   * @param folderPath 文件夹路径
   * @returns 是否存在
   */
  static async folderExists(folderPath: string): Promise<boolean> {
    return await FilesystemOperations.folderExists(folderPath)
  }

  /**
   * 重命名项目文件夹
   * @param oldProjectName 旧项目名称
   * @param newProjectName 新项目名称
   * @param projectId 项目ID
   * @returns 新的文件夹路径
   */
  static async renameProjectFolder(
    oldProjectName: string,
    newProjectName: string,
    projectId: string
  ): Promise<string> {
    return await ProjectFolderManager.renameProjectFolder(oldProjectName, newProjectName, projectId)
  }

  /**
   * 删除项目文件夹
   * @param projectName 项目名称
   * @param projectId 项目ID
   * @param force 是否强制删除（即使文件夹不为空）
   */
  static async deleteProjectFolder(
    projectName: string,
    projectId: string,
    force: boolean = false
  ): Promise<void> {
    return await ProjectFolderManager.deleteProjectFolder(projectName, projectId, force)
  }

  /**
   * 获取项目文件夹路径
   * @param projectName 项目名称
   * @param projectId 项目ID
   * @returns 项目文件夹路径
   */
  static async getProjectFolderPath(projectName: string, projectId: string): Promise<string> {
    return await ProjectFolderManager.getProjectFolderPath(projectName, projectId)
  }
}
