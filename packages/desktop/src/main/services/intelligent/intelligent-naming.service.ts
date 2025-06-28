import path from 'path'
import { PathUtils } from '../../utils/path-utils'

/**
 * 文档类型缩写映射
 */
const DOCUMENT_TYPE_ABBREVIATIONS: Record<string, string> = {
  business_plan: '商业计划书',
  presentation: 'PPT',
  report: '报告',
  proposal: '提案',
  specification: '说明书',
  other: '其他'
}

/**
 * 资产类型缩写映射
 */
const ASSET_TYPE_ABBREVIATIONS: Record<string, string> = {
  screenshot: '截图',
  logo: 'LOGO',
  icon: '图标',
  diagram: '图表',
  photo: '照片',
  video: '视频',
  audio: '音频',
  other: '其他'
}

/**
 * 智能命名服务
 * 根据 DIRECTORY_DESIGN.md 中的规则生成标准化的文件名和路径
 */
export class IntelligentNamingService {
  /**
   * 为文档版本生成智能文件名
   * 规则：[逻辑文档类型缩写]_[版本标签]_[针对比赛/通用]_[日期或其他标识].[后缀]
   */
  static generateDocumentVersionFileName(params: {
    documentType: string
    versionTag: string
    isGenericVersion: boolean
    competitionInfo?: {
      seriesName?: string
      levelName?: string
      projectName?: string
    }
    originalFileName: string
    createdAt?: Date
  }): string {
    const {
      documentType,
      versionTag,
      isGenericVersion,
      competitionInfo,
      originalFileName,
      createdAt
    } = params

    // 获取文件扩展名
    const ext = path.extname(originalFileName)

    // 1. 文档类型缩写
    const typeAbbr = DOCUMENT_TYPE_ABBREVIATIONS[documentType] || 'DOC'

    // 2. 版本标签（清理特殊字符）
    const cleanVersionTag = PathUtils.sanitizeFileName(versionTag)

    // 3. 针对比赛/通用标识
    let targetIdentifier: string
    if (isGenericVersion) {
      targetIdentifier = '通用'
    } else if (competitionInfo?.seriesName && competitionInfo?.levelName) {
      const seriesAbbr = this.abbreviateCompetitionName(competitionInfo.seriesName)
      const levelAbbr = this.abbreviateCompetitionLevel(competitionInfo.levelName)
      targetIdentifier = `${seriesAbbr}_${levelAbbr}`

      // 如果有参赛项目名称，也包含进去
      if (competitionInfo.projectName) {
        const projectAbbr = PathUtils.sanitizeFileName(competitionInfo.projectName).substring(0, 10)
        targetIdentifier = `${projectAbbr}_${targetIdentifier}`
      }
    } else {
      targetIdentifier = '专用'
    }

    // 4. 日期标识（使用创建时间或当前时间）
    const date = createdAt || new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')

    // 组合文件名
    const fileName = `${typeAbbr}_${cleanVersionTag}_${targetIdentifier}_${dateStr}${ext}`

    // 确保文件名不超过合理长度
    return this.truncateFileName(fileName, 100)
  }

  /**
   * 为项目资产生成智能文件名
   * 规则：[资产类型缩写]_[资产名称/描述关键部分]_[日期或其他标识].[后缀]
   */
  static generateProjectAssetFileName(params: {
    assetType: string
    assetName: string
    originalFileName: string
    createdAt?: Date
  }): string {
    const { assetType, assetName, originalFileName, createdAt } = params

    // 获取文件扩展名
    const ext = path.extname(originalFileName)

    // 1. 资产类型缩写
    const typeAbbr = ASSET_TYPE_ABBREVIATIONS[assetType] || 'Asset'

    // 2. 资产名称（清理并截取关键部分）
    const cleanAssetName = PathUtils.sanitizeFileName(assetName).substring(0, 20)

    // 3. 日期标识
    const date = createdAt || new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')

    // 组合文件名
    const fileName = `${typeAbbr}_${cleanAssetName}_${dateStr}${ext}`

    return this.truncateFileName(fileName, 80)
  }

  /**
   * 为比赛通知生成智能文件名
   * 规则：通知_[赛段关键信息]_[年份或其他标识].[后缀]
   */
  static generateCompetitionNotificationFileName(params: {
    seriesName: string
    levelName: string
    originalFileName: string
    year?: number
  }): string {
    const { seriesName, levelName, originalFileName, year } = params

    // 获取文件扩展名
    const ext = path.extname(originalFileName)

    // 1. 固定前缀
    const prefix = '通知'

    // 2. 赛段关键信息
    const seriesAbbr = this.abbreviateCompetitionName(seriesName)
    const levelAbbr = this.abbreviateCompetitionLevel(levelName)
    const competitionInfo = `${seriesAbbr}${levelAbbr}`

    // 3. 年份标识
    const yearStr = year ? `${year}版` : `${new Date().getFullYear()}版`

    // 组合文件名
    const fileName = `${prefix}_${competitionInfo}_${yearStr}${ext}`

    return this.truncateFileName(fileName, 80)
  }

  /**
   * 缩写比赛名称
   */
  private static abbreviateCompetitionName(seriesName: string): string {
    const abbreviations: Record<string, string> = {
      挑战杯: '挑战杯',
      '互联网+大学生创新创业大赛': '互联网+',
      大学生创新创业训练计划: '大创',
      全国大学生数学建模竞赛: '数模',
      蓝桥杯: '蓝桥杯',
      ACM: 'ACM'
    }

    return abbreviations[seriesName] || PathUtils.sanitizeFileName(seriesName).substring(0, 6)
  }

  /**
   * 缩写比赛级别
   */
  private static abbreviateCompetitionLevel(levelName: string): string {
    const abbreviations: Record<string, string> = {
      校级初赛: '校赛',
      省级复赛: '省赛',
      国家级决赛: '国赛',
      校级: '校赛',
      省级: '省赛',
      国家级: '国赛',
      市级: '市赛',
      区级: '区赛'
    }

    return abbreviations[levelName] || PathUtils.sanitizeFileName(levelName).substring(0, 4)
  }

  /**
   * 截断文件名到指定长度，保留扩展名
   */
  private static truncateFileName(fileName: string, maxLength: number): string {
    if (fileName.length <= maxLength) {
      return fileName
    }

    const ext = path.extname(fileName)
    const nameWithoutExt = path.basename(fileName, ext)
    const maxNameLength = maxLength - ext.length

    if (maxNameLength <= 0) {
      return fileName.substring(0, maxLength)
    }

    return nameWithoutExt.substring(0, maxNameLength) + ext
  }

  /**
   * 生成唯一文件名（处理冲突）
   */
  static generateUniqueFileName(baseFileName: string, existingFiles: string[]): string {
    if (!existingFiles.includes(baseFileName)) {
      return baseFileName
    }

    const ext = path.extname(baseFileName)
    const nameWithoutExt = path.basename(baseFileName, ext)

    let counter = 1
    let uniqueName: string

    do {
      uniqueName = `${nameWithoutExt}_${counter}${ext}`
      counter++
    } while (existingFiles.includes(uniqueName))

    return uniqueName
  }

  /**
   * 验证生成的文件名是否符合规范
   */
  static validateFileName(fileName: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // 检查长度
    if (fileName.length > 255) {
      errors.push('文件名过长')
    }

    // 检查非法字符
    const illegalChars = /[<>:"/\\|?*]/
    if (illegalChars.test(fileName)) {
      errors.push('包含非法字符')
    }

    // 检查是否为空
    if (!fileName.trim()) {
      errors.push('文件名不能为空')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
