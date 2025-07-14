/**
 * API 相关的类型定义
 */

export interface ApiResponse<T = any> {
  /** 请求是否成功 */
  success: boolean
  /** 响应数据 */
  data?: T
  /** 错误信息 */
  error?: string
  /** 错误代码 */
  errorCode?: string
  /** 响应消息 */
  message?: string
  /** 时间戳 */
  timestamp?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** 分页信息 */
  pagination: {
    /** 当前页码 */
    page: number
    /** 每页大小 */
    pageSize: number
    /** 总数量 */
    total: number
    /** 总页数 */
    totalPages: number
    /** 是否有下一页 */
    hasNext: boolean
    /** 是否有上一页 */
    hasPrev: boolean
  }
}

export interface NamespaceApiResponse {
  /** 命名空间列表 */
  namespaces: Array<{
    name: string
    label?: string
    count?: number
    progress?: number
  }>
}

export interface LanguageApiResponse {
  /** 语言列表 */
  languages: Array<{
    code: string
    name: string
    isBase?: boolean
  }>
}

export interface TranslationFileApiResponse {
  /** 翻译文件内容 */
  content: Record<string, any>
  /** 文件元信息 */
  meta?: {
    lastModified?: string
    size?: number
    encoding?: string
  }
}

export interface SaveTranslationRequest {
  /** 命名空间 */
  namespace: string
  /** 语言代码 */
  language: string
  /** 翻译内容 */
  content: Record<string, any>
  /** 是否美化输出 */
  prettyPrint?: boolean
}

export interface CreateLanguageRequest {
  /** 语言代码 */
  languageCode: string
  /** 语言名称 */
  languageName?: string
  /** 是否设为基准语言 */
  isBase?: boolean
  /** 是否复制现有翻译 */
  copyFromLanguage?: string
}

export interface CreateNamespaceRequest {
  /** 命名空间名称 */
  name: string
  /** 显示名称 */
  displayName?: string
  /** 初始翻译内容 */
  initialContent?: Record<string, any>
}

export interface ValidateTranslationRequest {
  /** 命名空间 */
  namespace?: string
  /** 语言代码 */
  language?: string
  /** 验证选项 */
  options?: {
    /** 检查缺失的键 */
    checkMissingKeys?: boolean
    /** 检查空值 */
    checkEmptyValues?: boolean
    /** 检查格式 */
    checkFormat?: boolean
    /** 检查重复键 */
    checkDuplicateKeys?: boolean
  }
}

export interface ExportTranslationRequest {
  /** 导出格式 */
  format: 'json' | 'csv' | 'xlsx' | 'po'
  /** 包含的语言 */
  languages?: string[]
  /** 包含的命名空间 */
  namespaces?: string[]
  /** 导出选项 */
  options?: {
    includeUntranslated?: boolean
    prettyPrint?: boolean
    includeMetadata?: boolean
  }
}

export interface ImportTranslationRequest {
  /** 导入格式 */
  format: 'json' | 'csv' | 'xlsx' | 'po'
  /** 文件内容（base64 编码） */
  fileContent: string
  /** 目标语言 */
  targetLanguage: string
  /** 目标命名空间 */
  targetNamespace: string
  /** 导入选项 */
  options?: {
    overwriteExisting?: boolean
    createMissingKeys?: boolean
    validateFormat?: boolean
  }
}

export interface SearchTranslationRequest {
  /** 搜索查询 */
  query: string
  /** 搜索选项 */
  options?: {
    caseSensitive?: boolean
    useRegex?: boolean
    scope?: 'key' | 'value' | 'both'
    languages?: string[]
    namespaces?: string[]
  }
}

export interface SearchTranslationResponse {
  /** 搜索结果 */
  results: Array<{
    namespace: string
    language: string
    keyPath: string
    value: any
    matchType: 'key' | 'value'
    context?: string
  }>
  /** 搜索统计 */
  stats: {
    totalMatches: number
    matchedKeys: number
    searchTime: number
  }
}

export interface FileSystemApiResponse {
  /** 操作是否成功 */
  success: boolean
  /** 文件路径 */
  path?: string
  /** 文件大小 */
  size?: number
  /** 最后修改时间 */
  lastModified?: string
  /** 错误信息 */
  error?: string
}

export interface BackupApiResponse {
  /** 备份文件列表 */
  backups: Array<{
    id: string
    name: string
    createdAt: string
    size: number
    description?: string
  }>
}

export interface RestoreBackupRequest {
  /** 备份 ID */
  backupId: string
  /** 恢复选项 */
  options?: {
    overwriteExisting?: boolean
    createBackupBeforeRestore?: boolean
  }
}

export interface ApiError {
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 详细信息 */
  details?: any
  /** 堆栈跟踪（开发环境） */
  stack?: string
}

export interface ApiRequestConfig {
  /** 请求超时时间（毫秒） */
  timeout?: number
  /** 重试次数 */
  retries?: number
  /** 是否显示加载状态 */
  showLoading?: boolean
  /** 是否显示错误提示 */
  showError?: boolean
}
