import { BrowserWindow } from 'electron'
import path from 'path'
import { FilesystemOperations } from '../utils/filesystem-operations'
import type { SuccessResponse } from '../types/outputs'

export interface QuickLookPreviewInput {
  fileId: string
}

export interface QuickLookPreviewByPathInput {
  filePath: string
}

/**
 * QuickLook 预览服务
 * 使用苹果原生的 QuickLook 功能预览文件
 */
export class QuickLookService {
  /**
   * 使用 QuickLook 预览文件（通过文件路径）
   */
  static async previewFileByPath(input: QuickLookPreviewByPathInput): Promise<SuccessResponse> {
    try {
      const { filePath } = input

      // 验证文件是否存在
      if (!(await FilesystemOperations.fileExists(filePath))) {
        throw new Error('文件不存在')
      }

      // 检查是否在 macOS 上
      if (process.platform !== 'darwin') {
        throw new Error('QuickLook 只在 macOS 上可用')
      }

      // 使用 Electron 原生 QuickLook 预览文件
      const fileName = path.basename(filePath)
      this.launchQuickLook(filePath, fileName)

      console.log(`QuickLook 预览已启动: ${filePath}`)
      return { success: true }
    } catch (error) {
      console.error('QuickLook 预览失败:', error)
      throw new Error(error instanceof Error ? error.message : 'QuickLook 预览失败')
    }
  }

  /**
   * 使用 QuickLook 预览文件（通过文件ID）
   */
  static async previewFileById(input: QuickLookPreviewInput): Promise<SuccessResponse> {
    try {
      const { fileId } = input

      // 这里需要从数据库获取文件路径
      // 由于我们需要访问 ManagedFileService，我们需要导入它
      const { ManagedFileService } = await import('./managed-file.service')

      const file = await ManagedFileService.getManagedFile({ id: fileId })
      if (!file) {
        throw new Error('文件不存在')
      }

      // 使用文件路径预览，传递原始文件名作为显示名称
      const displayName = file.originalFileName || path.basename(file.physicalPath)
      this.launchQuickLook(file.physicalPath, displayName)

      console.log(`QuickLook 预览已启动: ${displayName}`)
      return { success: true }
    } catch (error) {
      console.error('QuickLook 预览失败:', error)
      throw new Error(error instanceof Error ? error.message : 'QuickLook 预览失败')
    }
  }

  /**
   * 启动 QuickLook 预览
   * 使用 Electron 原生的 previewFile 方法
   */
  private static launchQuickLook(filePath: string, displayName?: string): void {
    // 检查是否在 macOS 上
    if (process.platform !== 'darwin') {
      throw new Error('QuickLook 只在 macOS 上可用')
    }

    // 获取当前聚焦的窗口，如果没有则获取第一个窗口
    const focusedWindow = BrowserWindow.getFocusedWindow()
    const targetWindow = focusedWindow || BrowserWindow.getAllWindows()[0]

    if (!targetWindow) {
      throw new Error('没有可用的窗口来显示 QuickLook 预览')
    }

    // 使用 Electron 原生的 previewFile 方法
    targetWindow.previewFile(filePath, displayName)
  }

  /**
   * 检查 QuickLook 是否可用
   * 使用 Electron 原生方法，在 macOS 上总是可用
   */
  static async isQuickLookAvailable(): Promise<boolean> {
    // QuickLook 只在 macOS 上可用
    if (process.platform !== 'darwin') {
      return false
    }

    // 检查是否有可用的窗口
    const windows = BrowserWindow.getAllWindows()
    return windows.length > 0
  }

  /**
   * 获取支持的文件类型
   * QuickLook 支持大多数常见文件类型
   */
  static getSupportedFileTypes(): string[] {
    return [
      // 图片
      'jpg',
      'jpeg',
      'png',
      'gif',
      'bmp',
      'tiff',
      'webp',
      'svg',
      'ico',
      // 文档
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'rtf',
      'txt',
      'md',
      // 代码
      'js',
      'ts',
      'jsx',
      'tsx',
      'html',
      'css',
      'scss',
      'json',
      'xml',
      'yaml',
      'yml',
      'py',
      'java',
      'cpp',
      'c',
      'h',
      'swift',
      'go',
      'rs',
      'php',
      'rb',
      'sh',
      // 音频
      'mp3',
      'wav',
      'aac',
      'flac',
      'm4a',
      'ogg',
      // 视频
      'mp4',
      'mov',
      'avi',
      'mkv',
      'webm',
      'm4v',
      // 压缩包
      'zip',
      'rar',
      '7z',
      'tar',
      'gz',
      // 其他
      'epub',
      'mobi',
      'pages',
      'numbers',
      'key'
    ]
  }

  /**
   * 检查文件是否支持 QuickLook 预览
   */
  static isFileSupported(fileName: string): boolean {
    const extension = path.extname(fileName).toLowerCase().slice(1)
    return this.getSupportedFileTypes().includes(extension)
  }
}
