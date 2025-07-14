/**
 * 翻译相关的类型定义
 */

export interface Language {
  /** 语言代码，如 'zh-CN', 'en-US' */
  code: string
  /** 语言显示名称 */
  name: string
  /** 是否为基准语言 */
  isBase?: boolean
}

export interface Namespace {
  /** 命名空间名称 */
  name: string
  /** 显示名称 */
  displayName: string
  /** 翻译键数量 */
  keyCount: number
  /** 翻译进度百分比 */
  progress: number
}

export interface TranslationEntry {
  /** 翻译键名（最后一级） */
  key: string
  /** 完整路径，如 'common.buttons.save' */
  path: string
  /** 各语言的翻译值 */
  values: Record<string, any>
  /** 数据类型 */
  type: 'string' | 'array' | 'object' | 'number' | 'boolean'
  /** 是否已修改 */
  isModified: boolean
}

export interface TranslationValue {
  /** 字符串值 */
  string?: string
  /** 数组值 */
  array?: string[]
  /** 对象值 */
  object?: Record<string, any>
  /** 数字值 */
  number?: number
  /** 布尔值 */
  boolean?: boolean
}

export interface TranslationFile {
  /** 文件路径 */
  path: string
  /** 命名空间 */
  namespace: string
  /** 语言代码 */
  language: string
  /** 翻译内容 */
  content: Record<string, any>
  /** 最后修改时间 */
  lastModified?: Date
}

export interface TranslationProgress {
  /** 总翻译键数 */
  total: number
  /** 已完成翻译数 */
  completed: number
  /** 进度百分比 */
  percentage: number
  /** 未翻译的键数 */
  untranslated: number
}

export interface TranslationStats {
  /** 命名空间统计 */
  namespaces: number
  /** 语言数量 */
  languages: number
  /** 总翻译键数 */
  totalKeys: number
  /** 平均进度 */
  averageProgress: number
}

export interface SearchOptions {
  /** 搜索查询 */
  query: string
  /** 是否区分大小写 */
  caseSensitive?: boolean
  /** 是否使用正则表达式 */
  useRegex?: boolean
  /** 搜索范围 */
  scope?: 'key' | 'value' | 'both'
}

export interface FilterOptions {
  /** 只显示未翻译的条目 */
  showOnlyUntranslated?: boolean
  /** 只显示已修改的条目 */
  showOnlyModified?: boolean
  /** 按类型筛选 */
  filterByType?: TranslationEntry['type'][]
  /** 按语言筛选 */
  filterByLanguage?: string[]
}

export interface ValidationResult {
  /** 是否有效 */
  isValid: boolean
  /** 错误信息 */
  errors: ValidationError[]
  /** 警告信息 */
  warnings: ValidationWarning[]
}

export interface ValidationError {
  /** 错误类型 */
  type: 'missing_key' | 'invalid_format' | 'duplicate_key' | 'empty_value'
  /** 错误消息 */
  message: string
  /** 相关的键路径 */
  keyPath?: string
  /** 相关的语言 */
  language?: string
  /** 行号（如果适用） */
  line?: number
}

export interface ValidationWarning {
  /** 警告类型 */
  type: 'unused_key' | 'inconsistent_type' | 'long_text'
  /** 警告消息 */
  message: string
  /** 相关的键路径 */
  keyPath?: string
  /** 相关的语言 */
  language?: string
}

export interface ExportOptions {
  /** 导出格式 */
  format: 'json' | 'csv' | 'xlsx' | 'po'
  /** 包含的语言 */
  languages?: string[]
  /** 包含的命名空间 */
  namespaces?: string[]
  /** 是否包含未翻译的条目 */
  includeUntranslated?: boolean
  /** 是否美化输出 */
  prettyPrint?: boolean
}

export interface ImportOptions {
  /** 导入格式 */
  format: 'json' | 'csv' | 'xlsx' | 'po'
  /** 目标语言 */
  targetLanguage: string
  /** 目标命名空间 */
  targetNamespace: string
  /** 是否覆盖现有翻译 */
  overwriteExisting?: boolean
  /** 是否创建缺失的键 */
  createMissingKeys?: boolean
}
