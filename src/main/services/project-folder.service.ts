import fs from 'fs'
import path from 'path'
import os from 'os'
import { SettingsService } from './settings.service'

export class ProjectFolderService {
  /**
   * 清理文件名中的非法字符
   * @param name 原始名称
   * @returns 清理后的名称
   */
  static sanitizeFileName(name: string): string {
    // 移除或替换文件系统不允许的字符
    return name
      .replace(/[/\\:*?"<>|]/g, '_') // 替换非法字符为下划线
      .replace(/\s+/g, '_') // 替换空格为下划线
      .replace(/_{2,}/g, '_') // 合并多个下划线为一个
      .replace(/^_+|_+$/g, '') // 移除开头和结尾的下划线
      .substring(0, 50) // 限制长度，避免路径过长
  }

  /**
   * 生成项目文件夹名称
   * @param projectName 项目名称
   * @param projectId 项目ID
   * @returns 文件夹名称
   */
  static generateProjectFolderName(projectName: string, projectId: string): string {
    const sanitizedName = this.sanitizeFileName(projectName)
    const shortId = projectId.substring(0, 8) // 使用前8位ID
    return `${sanitizedName}_${shortId}`
  }

  /**
   * 获取默认项目根路径
   * @returns 默认项目路径
   */
  static async getDefaultProjectPath(): Promise<string> {
    try {
      const setting = await SettingsService.getSetting({ key: 'general.defaultProjectPath' })
      if (setting && setting.value) {
        // 设置值是JSON格式存储的，需要解析
        const value = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value
        return value as string
      }
    } catch (error) {
      console.warn('获取默认项目路径失败:', error)
    }

    // 如果没有设置，返回默认路径
    return path.join(os.homedir(), 'Documents', 'ClarityFile')
  }

  /**
   * 创建项目文件夹结构
   * @param projectName 项目名称
   * @param projectId 项目ID
   * @returns 创建的项目文件夹路径
   */
  static async createProjectFolder(projectName: string, projectId: string): Promise<string> {
    const defaultPath = await this.getDefaultProjectPath()
    const folderName = this.generateProjectFolderName(projectName, projectId)
    const projectPath = path.join(defaultPath, 'Projects', folderName)

    try {
      // 确保根目录存在
      await fs.promises.mkdir(path.join(defaultPath, 'Projects'), { recursive: true })

      // 创建项目文件夹
      await fs.promises.mkdir(projectPath, { recursive: true })

      // 创建基础子文件夹结构
      const subFolders = [
        '_Assets', // 项目资产
        '_Expenses', // 经费报销
        'Documents' // 文档
      ]

      for (const subFolder of subFolders) {
        await fs.promises.mkdir(path.join(projectPath, subFolder), { recursive: true })
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
   * 检查文件夹是否存在
   * @param folderPath 文件夹路径
   * @returns 是否存在
   */
  static async folderExists(folderPath: string): Promise<boolean> {
    try {
      const stats = await fs.promises.stat(folderPath)
      return stats.isDirectory()
    } catch {
      return false
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
    const defaultPath = await this.getDefaultProjectPath()
    const oldFolderName = this.generateProjectFolderName(oldProjectName, projectId)
    const newFolderName = this.generateProjectFolderName(newProjectName, projectId)

    const oldPath = path.join(defaultPath, 'Projects', oldFolderName)
    const newPath = path.join(defaultPath, 'Projects', newFolderName)

    try {
      // 检查旧文件夹是否存在
      if (await this.folderExists(oldPath)) {
        // 检查新文件夹名是否已存在
        if (await this.folderExists(newPath)) {
          throw new Error(`目标文件夹已存在: ${newPath}`)
        }

        // 重命名文件夹
        await fs.promises.rename(oldPath, newPath)
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
   * 检查文件夹是否只包含标准子文件夹（空的）
   * @param folderPath 文件夹路径
   * @returns 是否只包含空的标准子文件夹
   */
  static async isProjectFolderEmpty(folderPath: string): Promise<boolean> {
    try {
      const files = await fs.promises.readdir(folderPath)
      const standardSubFolders = ['_Assets', '_Expenses', 'Documents']

      // 检查是否只包含标准子文件夹
      const nonStandardFiles = files.filter((file) => !standardSubFolders.includes(file))
      if (nonStandardFiles.length > 0) {
        return false // 包含非标准文件或文件夹
      }

      // 检查标准子文件夹是否为空
      for (const file of files) {
        const filePath = path.join(folderPath, file)
        const stats = await fs.promises.stat(filePath)
        if (stats.isDirectory()) {
          const subFiles = await fs.promises.readdir(filePath)
          if (subFiles.length > 0) {
            return false // 子文件夹不为空
          }
        }
      }

      return true // 文件夹为空或只包含空的标准子文件夹
    } catch {
      return false
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
    const defaultPath = await this.getDefaultProjectPath()
    const folderName = this.generateProjectFolderName(projectName, projectId)
    const projectPath = path.join(defaultPath, 'Projects', folderName)

    try {
      if (await this.folderExists(projectPath)) {
        if (force) {
          // 强制删除整个文件夹
          await fs.promises.rm(projectPath, { recursive: true, force: true })
          console.log(`项目文件夹已强制删除: ${projectPath}`)
        } else {
          // 检查文件夹是否为空（只包含空的标准子文件夹）
          if (await this.isProjectFolderEmpty(projectPath)) {
            await fs.promises.rm(projectPath, { recursive: true, force: true })
            console.log(`空项目文件夹已删除: ${projectPath}`)
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
    const defaultPath = await this.getDefaultProjectPath()
    const folderName = this.generateProjectFolderName(projectName, projectId)
    return path.join(defaultPath, 'Projects', folderName)
  }
}
