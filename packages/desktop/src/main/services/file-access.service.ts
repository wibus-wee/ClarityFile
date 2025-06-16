import fs from 'fs'
import { FilesystemOperations } from '../utils/filesystem-operations'
import { MimeTypeUtils } from '../utils/mime-type-utils'

export interface GetFileDataInput {
  filePath: string
}

export interface GetFileDataOutput {
  success: boolean
  data?: string // base64 encoded data
  mimeType?: string
  error?: string
}

/**
 * 文件访问服务
 * 负责安全地为渲染进程提供本地文件访问
 */
export class FileAccessService {
  /**
   * 获取文件数据（以 base64 格式返回）
   * 主要用于在渲染进程中显示图片等文件
   */
  static async getFileData(input: GetFileDataInput): Promise<GetFileDataOutput> {
    try {
      const { filePath } = input

      // 验证文件是否存在
      if (!(await FilesystemOperations.fileExists(filePath))) {
        return {
          success: false,
          error: '文件不存在'
        }
      }

      // 读取文件
      const fileBuffer = await fs.promises.readFile(filePath)

      // 转换为 base64
      const base64Data = fileBuffer.toString('base64')

      // 获取 MIME 类型
      const mimeType = MimeTypeUtils.getMimeType(filePath)

      return {
        success: true,
        data: base64Data,
        mimeType
      }
    } catch (error) {
      console.error('读取文件失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '读取文件失败'
      }
    }
  }

  /**
   * 检查文件是否为图片类型
   */
  static isImageFile(filePath: string): boolean {
    return MimeTypeUtils.isImageFile(filePath)
  }

  /**
   * 生成安全的文件 URL（data URL）
   */
  static async generateFileDataUrl(filePath: string): Promise<string | null> {
    try {
      const result = await this.getFileData({ filePath })

      if (!result.success || !result.data || !result.mimeType) {
        return null
      }

      return `data:${result.mimeType};base64,${result.data}`
    } catch (error) {
      console.error('生成文件 data URL 失败:', error)
      return null
    }
  }
}
