/**
 * 类型验证工具函数
 * 用于运行时验证数据是否符合定义的类型
 */

import type { 
  Language, 
  Namespace, 
  TranslationEntry, 
  ApiResponse,
  ValidationResult,
  ValidationError 
} from '~/types'

/**
 * 验证语言对象是否有效
 */
export function validateLanguage(obj: any): obj is Language {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.code === 'string' &&
    typeof obj.name === 'string' &&
    (obj.isBase === undefined || typeof obj.isBase === 'boolean')
  )
}

/**
 * 验证命名空间对象是否有效
 */
export function validateNamespace(obj: any): obj is Namespace {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.name === 'string' &&
    typeof obj.displayName === 'string' &&
    typeof obj.keyCount === 'number' &&
    typeof obj.progress === 'number' &&
    obj.progress >= 0 &&
    obj.progress <= 100
  )
}

/**
 * 验证翻译条目是否有效
 */
export function validateTranslationEntry(obj: any): obj is TranslationEntry {
  const validTypes = ['string', 'array', 'object', 'number', 'boolean']
  
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.key === 'string' &&
    typeof obj.path === 'string' &&
    typeof obj.values === 'object' &&
    obj.values !== null &&
    validTypes.includes(obj.type) &&
    typeof obj.isModified === 'boolean'
  )
}

/**
 * 验证 API 响应格式是否有效
 */
export function validateApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.success === 'boolean' &&
    (obj.data === undefined || obj.data !== null) &&
    (obj.error === undefined || typeof obj.error === 'string') &&
    (obj.errorCode === undefined || typeof obj.errorCode === 'string') &&
    (obj.message === undefined || typeof obj.message === 'string') &&
    (obj.timestamp === undefined || typeof obj.timestamp === 'string')
  )
}

/**
 * 创建验证错误
 */
export function createValidationError(
  type: ValidationError['type'],
  message: string,
  keyPath?: string,
  language?: string,
  line?: number
): ValidationError {
  return {
    type,
    message,
    keyPath,
    language,
    line
  }
}

/**
 * 验证翻译值是否为空
 */
export function isEmptyTranslationValue(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0 || value.every(item => 
    typeof item === 'string' ? item.trim() === '' : !item
  )
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 验证语言代码格式
 */
export function validateLanguageCode(code: string): boolean {
  // 支持格式：zh-CN, en-US, fr, de 等
  const languageCodeRegex = /^[a-z]{2}(-[A-Z]{2})?$/
  return languageCodeRegex.test(code)
}

/**
 * 验证命名空间名称格式
 */
export function validateNamespaceName(name: string): boolean {
  // 只允许字母、数字、下划线和连字符
  const namespaceNameRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/
  return namespaceNameRegex.test(name)
}

/**
 * 验证翻译键路径格式
 */
export function validateKeyPath(path: string): boolean {
  // 格式：key1.key2.key3，不允许空键或特殊字符
  const keyPathRegex = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)*$/
  return keyPathRegex.test(path)
}

/**
 * 类型安全的深度克隆
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T
  }
  
  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  
  return cloned
}

/**
 * 类型安全的对象合并
 */
export function mergeObjects<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target }
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key]
      if (sourceValue !== undefined) {
        result[key] = sourceValue
      }
    }
  }
  
  return result
}

/**
 * 创建类型安全的验证结果
 */
export function createValidationResult(
  isValid: boolean,
  errors: ValidationError[] = [],
  warnings: any[] = []
): ValidationResult {
  return {
    isValid,
    errors,
    warnings
  }
}
