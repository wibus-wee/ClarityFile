import mimeTypes from 'mime-types'
import path from 'path'

/**
 * MIME 类型工具类
 * 统一管理项目中的 MIME 类型检测逻辑，消除代码重复
 */
export class MimeTypeUtils {
  /**
   * 根据文件路径或扩展名获取 MIME 类型
   * @param filePath 文件路径或扩展名
   * @returns MIME 类型字符串，如果无法识别则返回 'application/octet-stream'
   */
  static getMimeType(filePath: string): string {
    const mimeType = mimeTypes.lookup(filePath)
    return mimeType || 'application/octet-stream'
  }

  /**
   * 根据 MIME 类型获取默认文件扩展名
   * @param mimeType MIME 类型
   * @returns 文件扩展名（不包含点），如果无法识别则返回 null
   */
  static getExtension(mimeType: string): string | null {
    return mimeTypes.extension(mimeType) || null
  }

  /**
   * 创建完整的 Content-Type 头部
   * @param filePath 文件路径或扩展名
   * @returns 完整的 Content-Type 字符串，包含 charset（如果适用）
   */
  static getContentType(filePath: string): string {
    const contentType = mimeTypes.contentType(filePath)
    return contentType || 'application/octet-stream'
  }

  /**
   * 检查文件是否为图片类型
   * @param filePath 文件路径
   * @returns 是否为图片文件
   */
  static isImageFile(filePath: string): boolean {
    const mimeType = this.getMimeType(filePath)
    return mimeType.startsWith('image/')
  }

  /**
   * 检查文件是否为视频类型
   * @param filePath 文件路径
   * @returns 是否为视频文件
   */
  static isVideoFile(filePath: string): boolean {
    const mimeType = this.getMimeType(filePath)
    return mimeType.startsWith('video/')
  }

  /**
   * 检查文件是否为音频类型
   * @param filePath 文件路径
   * @returns 是否为音频文件
   */
  static isAudioFile(filePath: string): boolean {
    const mimeType = this.getMimeType(filePath)
    return mimeType.startsWith('audio/')
  }

  /**
   * 检查文件是否为文档类型
   * @param filePath 文件路径
   * @returns 是否为文档文件
   */
  static isDocumentFile(filePath: string): boolean {
    const mimeType = this.getMimeType(filePath)
    const documentMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/markdown',
      'application/rtf'
    ]
    return documentMimeTypes.includes(mimeType) || mimeType.startsWith('text/')
  }

  /**
   * 检查文件是否为压缩文件类型
   * @param filePath 文件路径
   * @returns 是否为压缩文件
   */
  static isArchiveFile(filePath: string): boolean {
    const mimeType = this.getMimeType(filePath)
    const archiveMimeTypes = [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-bzip2'
    ]
    return archiveMimeTypes.includes(mimeType)
  }

  /**
   * 根据文件类型分类获取支持的扩展名列表
   * @param category 文件类型分类
   * @returns 支持的扩展名数组
   */
  static getSupportedExtensions(
    category: 'image' | 'video' | 'audio' | 'document' | 'archive'
  ): string[] {
    const extensionMap = {
      image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff'],
      video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'],
      audio: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'],
      document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md', '.rtf'],
      archive: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2']
    }
    return extensionMap[category] || []
  }

  /**
   * 检查文件类型是否在支持的扩展名列表中
   * @param filePath 文件路径
   * @param supportedExtensions 支持的扩展名数组
   * @returns 是否支持该文件类型
   */
  static isFileTypeSupported(filePath: string, supportedExtensions: string[]): boolean {
    const ext = path.extname(filePath).toLowerCase()
    return supportedExtensions.includes(ext) || supportedExtensions.includes('.*')
  }

  /**
   * 获取文件的基本信息
   * @param filePath 文件路径
   * @returns 文件的基本信息对象
   */
  static getFileInfo(filePath: string) {
    const ext = path.extname(filePath).toLowerCase()
    const mimeType = this.getMimeType(filePath)
    const contentType = this.getContentType(filePath)

    return {
      extension: ext,
      mimeType,
      contentType,
      isImage: this.isImageFile(filePath),
      isVideo: this.isVideoFile(filePath),
      isAudio: this.isAudioFile(filePath),
      isDocument: this.isDocumentFile(filePath),
      isArchive: this.isArchiveFile(filePath)
    }
  }
}
