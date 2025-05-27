import fs from 'fs'
import path from 'path'

/**
 * 文件系统操作类
 * 负责底层的文件和文件夹操作
 */
export class FilesystemOperations {
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
   * 检查文件是否存在
   * @param filePath 文件路径
   * @returns 是否存在
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.promises.stat(filePath)
      return stats.isFile()
    } catch {
      return false
    }
  }

  /**
   * 创建文件夹
   * @param folderPath 文件夹路径
   * @param recursive 是否递归创建
   * @returns 是否成功
   */
  static async createFolder(folderPath: string, recursive: boolean = true): Promise<boolean> {
    try {
      await fs.promises.mkdir(folderPath, { recursive })
      return true
    } catch (error) {
      console.error(`创建文件夹失败 ${folderPath}:`, error)
      return false
    }
  }

  /**
   * 删除文件夹
   * @param folderPath 文件夹路径
   * @param force 是否强制删除
   * @returns 是否成功
   */
  static async deleteFolder(folderPath: string, force: boolean = false): Promise<boolean> {
    try {
      if (force) {
        await fs.promises.rm(folderPath, { recursive: true, force: true })
      } else {
        await fs.promises.rmdir(folderPath)
      }
      return true
    } catch (error) {
      console.error(`删除文件夹失败 ${folderPath}:`, error)
      return false
    }
  }

  /**
   * 重命名文件夹
   * @param oldPath 旧路径
   * @param newPath 新路径
   * @returns 是否成功
   */
  static async renameFolder(oldPath: string, newPath: string): Promise<boolean> {
    try {
      await fs.promises.rename(oldPath, newPath)
      return true
    } catch (error) {
      console.error(`重命名文件夹失败 ${oldPath} -> ${newPath}:`, error)
      return false
    }
  }

  /**
   * 获取文件夹内容
   * @param folderPath 文件夹路径
   * @returns 文件夹内容列表
   */
  static async getFolderContents(folderPath: string): Promise<string[]> {
    try {
      return await fs.promises.readdir(folderPath)
    } catch (error) {
      console.error(`读取文件夹内容失败 ${folderPath}:`, error)
      return []
    }
  }

  /**
   * 检查文件夹是否为空
   * @param folderPath 文件夹路径
   * @returns 是否为空
   */
  static async isFolderEmpty(folderPath: string): Promise<boolean> {
    try {
      const contents = await this.getFolderContents(folderPath)
      return contents.length === 0
    } catch {
      return false
    }
  }

  /**
   * 检查文件夹是否只包含指定的子文件夹（且这些子文件夹为空）
   * @param folderPath 文件夹路径
   * @param allowedSubFolders 允许的子文件夹列表
   * @returns 是否只包含空的指定子文件夹
   */
  static async isProjectFolderEmpty(
    folderPath: string, 
    allowedSubFolders: string[] = ['_Assets', '_Expenses', 'Documents']
  ): Promise<boolean> {
    try {
      const contents = await this.getFolderContents(folderPath)
      
      // 检查是否只包含允许的子文件夹
      const nonAllowedItems = contents.filter(item => !allowedSubFolders.includes(item))
      if (nonAllowedItems.length > 0) {
        return false // 包含非允许的文件或文件夹
      }
      
      // 检查允许的子文件夹是否为空
      for (const item of contents) {
        const itemPath = path.join(folderPath, item)
        const stats = await fs.promises.stat(itemPath)
        if (stats.isDirectory()) {
          const subContents = await this.getFolderContents(itemPath)
          if (subContents.length > 0) {
            return false // 子文件夹不为空
          }
        }
      }
      
      return true // 文件夹为空或只包含空的允许子文件夹
    } catch {
      return false
    }
  }

  /**
   * 复制文件
   * @param sourcePath 源文件路径
   * @param targetPath 目标文件路径
   * @returns 是否成功
   */
  static async copyFile(sourcePath: string, targetPath: string): Promise<boolean> {
    try {
      await fs.promises.copyFile(sourcePath, targetPath)
      return true
    } catch (error) {
      console.error(`复制文件失败 ${sourcePath} -> ${targetPath}:`, error)
      return false
    }
  }

  /**
   * 移动文件
   * @param sourcePath 源文件路径
   * @param targetPath 目标文件路径
   * @returns 是否成功
   */
  static async moveFile(sourcePath: string, targetPath: string): Promise<boolean> {
    try {
      await fs.promises.rename(sourcePath, targetPath)
      return true
    } catch (error) {
      console.error(`移动文件失败 ${sourcePath} -> ${targetPath}:`, error)
      return false
    }
  }

  /**
   * 删除文件
   * @param filePath 文件路径
   * @returns 是否成功
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.promises.unlink(filePath)
      return true
    } catch (error) {
      console.error(`删除文件失败 ${filePath}:`, error)
      return false
    }
  }

  /**
   * 获取文件信息
   * @param filePath 文件路径
   * @returns 文件信息
   */
  static async getFileStats(filePath: string): Promise<fs.Stats | null> {
    try {
      return await fs.promises.stat(filePath)
    } catch (error) {
      console.error(`获取文件信息失败 ${filePath}:`, error)
      return null
    }
  }
}
