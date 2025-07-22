/**
 * Store 辅助工具函数
 */

import type { StoreError, StoreActionResult } from '~/types'

/**
 * 创建标准化的 Store 错误
 */
export function createStoreError(code: string, message: string, details?: any): StoreError {
  return {
    code,
    message,
    details,
    timestamp: new Date()
  }
}

/**
 * 创建成功的操作结果
 */
export function createSuccessResult(data?: any, message?: string): StoreActionResult {
  return {
    success: true,
    message,
    data
  }
}

/**
 * 创建失败的操作结果
 */
export function createErrorResult(message: string, data?: any): StoreActionResult {
  return {
    success: false,
    message,
    data
  }
}

/**
 * 安全的异步操作包装器
 */
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  errorCode: string,
  errorMessage: string
): Promise<{ success: boolean; data?: T; error?: StoreError }> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    const storeError = createStoreError(
      errorCode,
      errorMessage,
      error instanceof Error ? error.message : String(error)
    )
    console.error(`[Store Error] ${errorCode}:`, storeError)
    return { success: false, error: storeError }
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// deepClone 函数已在 typeValidation.ts 中定义，通过 Nuxt 自动导入可用

/**
 * 验证必需字段
 */
export function validateRequiredFields(
  obj: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(
    (field) => obj[field] === undefined || obj[field] === null || obj[field] === ''
  )

  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 检查是否为客户端环境
 */
export function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * 安全的 localStorage 操作
 */
export const safeStorage = {
  getItem(key: string): string | null {
    if (!isClient()) return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('Failed to get item from localStorage:', error)
      return null
    }
  },

  setItem(key: string, value: string): boolean {
    if (!isClient()) return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn('Failed to set item to localStorage:', error)
      return false
    }
  },

  removeItem(key: string): boolean {
    if (!isClient()) return false
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn('Failed to remove item from localStorage:', error)
      return false
    }
  }
}

/**
 * 重试机制
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (i === maxRetries) {
        throw lastError
      }

      // 等待后重试
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }

  throw lastError!
}
