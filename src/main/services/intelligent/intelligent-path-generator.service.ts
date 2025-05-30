import path from 'path'
import { PathUtils } from '../../utils/path-utils'
import { FilesystemOperations } from '../../utils/filesystem-operations'

/**
 * 智能路径生成服务
 * 根据 DIRECTORY_DESIGN.md 中的文件系统映射策略生成标准化的文件路径
 */
export class IntelligentPathGeneratorService {
  /**
   * 生成项目文档的完整存储路径
   * 路径格式: CLARITY_FILE_ROOT/Projects/[项目名称_ID]/[逻辑文档名称]/
   */
  static async generateDocumentPath(params: {
    projectName: string
    projectId: string
    logicalDocumentName: string
  }): Promise<string> {
    const { projectName, projectId, logicalDocumentName } = params

    // 获取根目录
    const rootPath = await PathUtils.getDefaultProjectPath()

    // 生成项目文件夹名称：[项目名称_简短ID后几位]
    const projectFolderName = this.generateProjectFolderName(projectName, projectId)

    // 清理逻辑文档名称
    const cleanDocumentName = PathUtils.sanitizeFileName(logicalDocumentName)

    // 组合完整路径
    const fullPath = path.join(rootPath, 'Projects', projectFolderName, cleanDocumentName)

    return fullPath
  }

  /**
   * 生成项目资产的完整存储路径
   * 路径格式: CLARITY_FILE_ROOT/Projects/[项目名称_ID]/_Assets/[资产类型]/
   */
  static async generateProjectAssetPath(params: {
    projectName: string
    projectId: string
    assetType: string
  }): Promise<string> {
    const { projectName, projectId, assetType } = params

    // 获取根目录
    const rootPath = await PathUtils.getDefaultProjectPath()

    // 生成项目文件夹名称
    const projectFolderName = this.generateProjectFolderName(projectName, projectId)

    // 清理资产类型名称
    const cleanAssetType = PathUtils.sanitizeFileName(assetType)

    // 组合完整路径
    const fullPath = path.join(rootPath, 'Projects', projectFolderName, '_Assets', cleanAssetType)

    return fullPath
  }

  /**
   * 生成项目经费报销文件的完整存储路径
   * 路径格式: CLARITY_FILE_ROOT/Projects/[项目名称_ID]/_Expenses/[报销事项]/
   */
  static async generateProjectExpensePath(params: {
    projectName: string
    projectId: string
    expenseDescription: string
    applicantName?: string
  }): Promise<string> {
    const { projectName, projectId, expenseDescription, applicantName } = params

    // 获取根目录
    const rootPath = await PathUtils.getDefaultProjectPath()

    // 生成项目文件夹名称
    const projectFolderName = this.generateProjectFolderName(projectName, projectId)

    // 清理报销事项描述
    const cleanExpenseDesc = PathUtils.sanitizeFileName(expenseDescription)

    // 如果有申请人，添加到路径中
    let expenseFolderName = cleanExpenseDesc
    if (applicantName) {
      const cleanApplicantName = PathUtils.sanitizeFileName(applicantName)
      expenseFolderName = `${cleanExpenseDesc}_${cleanApplicantName}`
    }

    // 组合完整路径
    const fullPath = path.join(
      rootPath,
      'Projects',
      projectFolderName,
      '_Expenses',
      expenseFolderName
    )

    return fullPath
  }

  /**
   * 生成共享资源的完整存储路径
   * 路径格式: CLARITY_FILE_ROOT/SharedResources/[资源类型]/
   */
  static async generateSharedResourcePath(params: { resourceType: string }): Promise<string> {
    const { resourceType } = params

    // 获取根目录
    const rootPath = await PathUtils.getDefaultProjectPath()

    // 清理资源类型名称
    const cleanResourceType = PathUtils.sanitizeFileName(resourceType)

    // 组合完整路径
    const fullPath = path.join(rootPath, 'SharedResources', cleanResourceType)

    return fullPath
  }

  /**
   * 生成比赛资料的完整存储路径
   * 路径格式: CLARITY_FILE_ROOT/Competitions/[赛事系列]/[赛段]/
   */
  static async generateCompetitionPath(params: {
    seriesName: string
    levelName: string
  }): Promise<string> {
    const { seriesName, levelName } = params

    // 获取根目录
    const rootPath = await PathUtils.getDefaultProjectPath()

    // 清理赛事名称
    const cleanSeriesName = PathUtils.sanitizeFileName(seriesName)
    const cleanLevelName = PathUtils.sanitizeFileName(levelName)

    // 组合完整路径
    const fullPath = path.join(rootPath, 'Competitions', cleanSeriesName, cleanLevelName)

    return fullPath
  }

  /**
   * 生成临时文件的存储路径（Inbox）
   * 路径格式: CLARITY_FILE_ROOT/Inbox/[日期]/
   */
  static async generateInboxPath(params: { date?: Date } = {}): Promise<string> {
    const { date } = params

    // 获取根目录
    const rootPath = await PathUtils.getDefaultProjectPath()

    // 生成日期文件夹名称
    const targetDate = date || new Date()
    const dateFolder = targetDate.toISOString().slice(0, 10) // YYYY-MM-DD

    // 组合完整路径
    const fullPath = path.join(rootPath, 'Inbox', dateFolder)

    return fullPath
  }

  /**
   * 生成系统文件的存储路径
   * 路径格式: CLARITY_FILE_ROOT/System/[子类型]/
   */
  static async generateSystemPath(params: {
    subType: 'database' | 'config' | 'logs' | 'temp'
  }): Promise<string> {
    const { subType } = params

    // 获取根目录
    const rootPath = await PathUtils.getDefaultProjectPath()

    // 组合完整路径
    const fullPath = path.join(rootPath, 'System', subType)

    return fullPath
  }

  /**
   * 生成项目文件夹名称
   * 格式: [项目名称_简短ID后几位]
   */
  private static generateProjectFolderName(projectName: string, projectId: string): string {
    // 清理项目名称
    const cleanProjectName = PathUtils.sanitizeFileName(projectName)

    // 获取ID的后8位作为简短标识
    const shortId = projectId.slice(-8)

    return `${cleanProjectName}_${shortId}`
  }

  /**
   * 确保路径存在，如果不存在则创建
   */
  static async ensurePathExists(targetPath: string): Promise<boolean> {
    try {
      const exists = await FilesystemOperations.folderExists(targetPath)
      if (!exists) {
        return await FilesystemOperations.createFolder(targetPath, true)
      }
      return true
    } catch (error) {
      console.error(`创建路径失败: ${targetPath}`, error)
      return false
    }
  }

  /**
   * 生成完整的文件物理路径（路径 + 文件名）
   */
  static async generateCompleteFilePath(params: {
    type: 'document' | 'asset' | 'expense' | 'shared' | 'competition' | 'inbox'
    pathParams: any
    fileName: string
  }): Promise<string> {
    const { type, pathParams, fileName } = params

    let directoryPath: string

    switch (type) {
      case 'document':
        directoryPath = await this.generateDocumentPath(pathParams)
        break
      case 'asset':
        directoryPath = await this.generateProjectAssetPath(pathParams)
        break
      case 'expense':
        directoryPath = await this.generateProjectExpensePath(pathParams)
        break
      case 'shared':
        directoryPath = await this.generateSharedResourcePath(pathParams)
        break
      case 'competition':
        directoryPath = await this.generateCompetitionPath(pathParams)
        break
      case 'inbox':
        directoryPath = await this.generateInboxPath(pathParams)
        break
      default:
        throw new Error(`不支持的文件类型: ${type}`)
    }

    // 确保目录存在
    await this.ensurePathExists(directoryPath)

    // 组合完整文件路径
    return path.join(directoryPath, fileName)
  }

  /**
   * 验证生成的路径是否符合规范
   */
  static validatePath(filePath: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // 检查路径长度
    if (filePath.length > 260) {
      // Windows路径长度限制
      errors.push('路径过长')
    }

    // 检查是否包含非法字符
    const illegalChars = /[<>:"|?*]/
    if (illegalChars.test(filePath)) {
      errors.push('路径包含非法字符')
    }

    // 检查是否为绝对路径
    if (!path.isAbsolute(filePath)) {
      errors.push('必须是绝对路径')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 获取路径的相对显示名称（用于UI显示）
   */
  static async getRelativeDisplayPath(fullPath: string): Promise<string> {
    try {
      const rootPath = await PathUtils.getDefaultProjectPath()
      if (rootPath && fullPath.startsWith(rootPath)) {
        return path.relative(rootPath, fullPath)
      }
    } catch (error) {
      console.warn('获取默认项目路径失败，使用完整路径:', error)
    }
    return fullPath
  }
}
