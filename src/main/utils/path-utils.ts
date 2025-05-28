import path from 'path'
import os from 'os'
import { SettingsService } from '../services/settings.service'

/**
 * 路径工具类
 * 负责文件路径的生成、清理和标准化
 */
export class PathUtils {
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
   * 生成项目文件夹的完整路径
   * @param projectName 项目名称
   * @param projectId 项目ID
   * @returns 项目文件夹的完整路径
   */
  static async generateProjectFolderPath(projectName: string, projectId: string): Promise<string> {
    const defaultPath = await this.getDefaultProjectPath()
    const folderName = this.generateProjectFolderName(projectName, projectId)
    return path.join(defaultPath, 'Projects', folderName)
  }

  /**
   * 生成文档类型文件夹路径
   * @param projectPath 项目文件夹路径
   * @param documentType 文档类型
   * @returns 文档类型文件夹路径
   */
  static generateDocumentTypeFolderPath(projectPath: string, documentType: string): string {
    const sanitizedType = this.sanitizeFileName(documentType)
    return path.join(projectPath, 'Documents', sanitizedType)
  }

  /**
   * 生成资产类型文件夹路径
   * @param projectPath 项目文件夹路径
   * @param assetType 资产类型
   * @returns 资产类型文件夹路径
   */
  static generateAssetTypeFolderPath(projectPath: string, assetType: string): string {
    const sanitizedType = this.sanitizeFileName(assetType)
    return path.join(projectPath, '_Assets', sanitizedType)
  }

  /**
   * 验证路径是否安全（在允许的根目录下）
   * @param targetPath 目标路径
   * @param allowedRoot 允许的根目录
   * @returns 是否安全
   */
  static isPathSafe(targetPath: string, allowedRoot: string): boolean {
    const normalizedTarget = path.resolve(targetPath)
    const normalizedRoot = path.resolve(allowedRoot)
    return normalizedTarget.startsWith(normalizedRoot)
  }

  /**
   * 获取相对路径
   * @param from 起始路径
   * @param to 目标路径
   * @returns 相对路径
   */
  static getRelativePath(from: string, to: string): string {
    return path.relative(from, to)
  }

  /**
   * 确保路径存在（创建必要的父目录）
   * @param targetPath 目标路径
   * @returns 是否成功
   */
  static async ensurePathExists(targetPath: string): Promise<boolean> {
    try {
      const fs = await import('fs')
      await fs.promises.mkdir(targetPath, { recursive: true })
      return true
    } catch (error) {
      console.error('创建路径失败:', error)
      return false
    }
  }
}
