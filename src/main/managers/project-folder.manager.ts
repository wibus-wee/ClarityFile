import { PathUtils } from '../utils/path-utils'
import { FilesystemOperations } from '../utils/filesystem-operations'

/**
 * 项目文件夹管理器
 * 负责项目文件夹的高级操作和业务逻辑
 */
export class ProjectFolderManager {
  // 标准子文件夹配置
  private static readonly STANDARD_SUBFOLDERS = [
    '_Assets', // 项目资产
    '_Expenses', // 经费报销
    'Documents' // 文档
  ]

  /**
   * 创建项目文件夹结构
   * @param projectName 项目名称
   * @param projectId 项目ID
   * @returns 创建的项目文件夹路径
   */
  static async createProjectFolder(projectName: string, projectId: string): Promise<string> {
    try {
      const projectPath = await PathUtils.generateProjectFolderPath(projectName, projectId)
      const defaultPath = await PathUtils.getDefaultProjectPath()

      // 确保根目录存在
      const projectsRootPath = `${defaultPath}/Projects`
      await FilesystemOperations.createFolder(projectsRootPath, true)

      // 创建项目文件夹
      const success = await FilesystemOperations.createFolder(projectPath, true)
      if (!success) {
        throw new Error('创建项目文件夹失败')
      }

      // 创建标准子文件夹
      for (const subFolder of this.STANDARD_SUBFOLDERS) {
        const subFolderPath = `${projectPath}/${subFolder}`
        await FilesystemOperations.createFolder(subFolderPath, true)
      }

      console.log(`项目文件夹创建成功: ${projectPath}`)
      return projectPath
    } catch (error) {
      console.error('创建项目文件夹失败:', error)
      throw new Error(
        `创建项目文件夹失败: ${error instanceof Error ? error.message : String(error)}`
      )
    }
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
    try {
      const oldPath = await PathUtils.generateProjectFolderPath(oldProjectName, projectId)
      const newPath = await PathUtils.generateProjectFolderPath(newProjectName, projectId)

      // 检查旧文件夹是否存在
      if (await FilesystemOperations.folderExists(oldPath)) {
        // 检查新文件夹名是否已存在
        if (await FilesystemOperations.folderExists(newPath)) {
          throw new Error(`目标文件夹已存在: ${newPath}`)
        }

        // 重命名文件夹
        const success = await FilesystemOperations.renameFolder(oldPath, newPath)
        if (!success) {
          throw new Error('重命名文件夹失败')
        }

        console.log(`项目文件夹重命名成功: ${oldPath} -> ${newPath}`)
      } else {
        // 如果旧文件夹不存在，创建新文件夹
        console.warn(`旧项目文件夹不存在，创建新文件夹: ${newPath}`)
        await this.createProjectFolder(newProjectName, projectId)
      }

      return newPath
    } catch (error) {
      console.error('重命名项目文件夹失败:', error)
      throw new Error(
        `重命名项目文件夹失败: ${error instanceof Error ? error.message : String(error)}`
      )
    }
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
    try {
      const projectPath = await PathUtils.generateProjectFolderPath(projectName, projectId)

      if (await FilesystemOperations.folderExists(projectPath)) {
        if (force) {
          // 强制删除整个文件夹
          const success = await FilesystemOperations.deleteFolder(projectPath, true)
          if (success) {
            console.log(`项目文件夹已强制删除: ${projectPath}`)
          }
        } else {
          // 检查文件夹是否为空（只包含空的标准子文件夹）
          const isEmpty = await FilesystemOperations.isProjectFolderEmpty(
            projectPath,
            this.STANDARD_SUBFOLDERS
          )

          if (isEmpty) {
            const success = await FilesystemOperations.deleteFolder(projectPath, true)
            if (success) {
              console.log(`空项目文件夹已删除: ${projectPath}`)
            }
          } else {
            console.warn(`项目文件夹包含文件，跳过删除: ${projectPath}`)
          }
        }
      } else {
        console.warn(`项目文件夹不存在: ${projectPath}`)
      }
    } catch (error) {
      console.error('删除项目文件夹失败:', error)
      throw new Error(
        `删除项目文件夹失败: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * 获取项目文件夹路径
   * @param projectName 项目名称
   * @param projectId 项目ID
   * @returns 项目文件夹路径
   */
  static async getProjectFolderPath(projectName: string, projectId: string): Promise<string> {
    return await PathUtils.generateProjectFolderPath(projectName, projectId)
  }

  /**
   * 检查项目文件夹是否存在
   * @param projectName 项目名称
   * @param projectId 项目ID
   * @returns 是否存在
   */
  static async projectFolderExists(projectName: string, projectId: string): Promise<boolean> {
    const projectPath = await this.getProjectFolderPath(projectName, projectId)
    return await FilesystemOperations.folderExists(projectPath)
  }

  /**
   * 创建文档类型文件夹
   * @param projectName 项目名称
   * @param projectId 项目ID
   * @param documentType 文档类型
   * @returns 文档类型文件夹路径
   */
  static async createDocumentTypeFolder(
    projectName: string,
    projectId: string,
    documentType: string
  ): Promise<string> {
    try {
      const projectPath = await this.getProjectFolderPath(projectName, projectId)
      const documentTypePath = PathUtils.generateDocumentTypeFolderPath(projectPath, documentType)

      const success = await FilesystemOperations.createFolder(documentTypePath, true)
      if (!success) {
        throw new Error('创建文档类型文件夹失败')
      }

      console.log(`文档类型文件夹创建成功: ${documentTypePath}`)
      return documentTypePath
    } catch (error) {
      console.error('创建文档类型文件夹失败:', error)
      throw new Error(
        `创建文档类型文件夹失败: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * 创建资产类型文件夹
   * @param projectName 项目名称
   * @param projectId 项目ID
   * @param assetType 资产类型
   * @returns 资产类型文件夹路径
   */
  static async createAssetTypeFolder(
    projectName: string,
    projectId: string,
    assetType: string
  ): Promise<string> {
    try {
      const projectPath = await this.getProjectFolderPath(projectName, projectId)
      const assetTypePath = PathUtils.generateAssetTypeFolderPath(projectPath, assetType)

      const success = await FilesystemOperations.createFolder(assetTypePath, true)
      if (!success) {
        throw new Error('创建资产类型文件夹失败')
      }

      console.log(`资产类型文件夹创建成功: ${assetTypePath}`)
      return assetTypePath
    } catch (error) {
      console.error('创建资产类型文件夹失败:', error)
      throw new Error(
        `创建资产类型文件夹失败: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
