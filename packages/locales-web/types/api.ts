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
