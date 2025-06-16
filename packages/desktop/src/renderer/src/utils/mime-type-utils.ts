/**
 * 前端 MIME 类型工具类
 * 与后端 MimeTypeUtils 保持一致的文件类型判断逻辑
 */
export class MimeTypeUtils {
  /**
   * 检查文件是否为图片类型
   * @param mimeType MIME 类型
   * @returns 是否为图片文件
   */
  static isImageFile(mimeType: string): boolean {
    if (!mimeType) return false
    return mimeType.startsWith('image/')
  }

  /**
   * 检查文件是否为视频类型
   * @param mimeType MIME 类型
   * @returns 是否为视频文件
   */
  static isVideoFile(mimeType: string): boolean {
    if (!mimeType) return false
    return mimeType.startsWith('video/')
  }

  /**
   * 检查文件是否为音频类型
   * @param mimeType MIME 类型
   * @returns 是否为音频文件
   */
  static isAudioFile(mimeType: string): boolean {
    if (!mimeType) return false
    return mimeType.startsWith('audio/')
  }

  /**
   * 检查文件是否为文档类型
   * @param mimeType MIME 类型
   * @returns 是否为文档文件
   */
  static isDocumentFile(mimeType: string): boolean {
    if (!mimeType) return false

    // 文本类型
    if (mimeType.startsWith('text/')) return true

    // 文档类型
    const documentMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/rtf',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation'
    ]

    return documentMimeTypes.includes(mimeType)
  }

  /**
   * 检查文件是否为压缩文件类型
   * @param mimeType MIME 类型
   * @returns 是否为压缩文件
   */
  static isArchiveFile(mimeType: string): boolean {
    if (!mimeType) return false

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
   * 获取文件类型的显示标签
   * @param mimeType MIME 类型
   * @returns 文件类型标签
   */
  static getFileTypeLabel(mimeType: string): string {
    if (!mimeType) return '未知类型'

    if (this.isImageFile(mimeType)) return '图片文件'
    if (this.isVideoFile(mimeType)) return '视频文件'
    if (this.isAudioFile(mimeType)) return '音频文件'
    if (this.isDocumentFile(mimeType)) return '文档文件'
    if (this.isArchiveFile(mimeType)) return '压缩文件'

    // 特定类型的标签
    const typeMap: Record<string, string> = {
      'application/pdf': 'PDF文档',
      'application/msword': 'Word文档',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
      'application/vnd.ms-excel': 'Excel表格',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel表格',
      'application/vnd.ms-powerpoint': 'PowerPoint演示',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint演示',
      'application/json': 'JSON文件',
      'text/plain': '文本文件',
      'text/markdown': 'Markdown文件'
    }

    return typeMap[mimeType] || '其他文件'
  }

  /**
   * 根据 MIME 类型获取文件类型分类
   * @param mimeType MIME 类型
   * @returns 文件类型分类 ('image' | 'video' | 'audio' | 'text' | 'application')
   */
  static getFileTypeCategory(mimeType: string): string {
    if (!mimeType) return 'application'

    if (this.isImageFile(mimeType)) return 'image'
    if (this.isVideoFile(mimeType)) return 'video'
    if (this.isAudioFile(mimeType)) return 'audio'
    if (this.isDocumentFile(mimeType)) return 'text'

    return 'application'
  }
}
