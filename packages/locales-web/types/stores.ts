/**
 * Pinia Stores 相关类型定义
 */

import type { Language, Namespace, TranslationEntry } from './translation'

// 翻译 Store 状态类型
export interface TranslationsState {
  activeNamespace: string
  namespaces: Namespace[]
  currentLanguage: string
  availableLanguages: Language[]
  translationEntries: TranslationEntry[]
  isLoading: boolean
  hasUnsavedChanges: boolean
  showOnlyUntranslated: boolean
}

// 设置 Store 状态类型
export interface SettingsState {
  theme: 'light' | 'dark' | 'auto'
  interfaceLanguage: string
  autoSave: boolean
  showKeyPaths: boolean
  baseLanguage: string
  prettyPrint: boolean
  isDark: boolean
}

// 文件系统 Store 状态类型
export interface FileSystemState {
  localesPath: string
  namespaces: NamespaceInfo[]
  isLoading: boolean
  error: string | null
}

// 命名空间信息类型
export interface NamespaceInfo {
  name: string
  label: string
  count: number
  languages: string[]
}

// 应用设置类型
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  interfaceLanguage: string
  autoSave: boolean
  showKeyPaths: boolean
  baseLanguage: string
  prettyPrint: boolean
}

// Store Actions 返回类型
export interface StoreActionResult {
  success: boolean
  message?: string
  data?: any
}

// 翻译操作结果类型
export interface TranslationOperationResult extends StoreActionResult {
  affectedEntries?: number
  modifiedLanguages?: string[]
}

// 文件操作结果类型
export interface FileOperationResult extends StoreActionResult {
  filePath?: string
  namespace?: string
  language?: string
}

// Store 错误类型
export interface StoreError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// 批量操作选项
export interface BatchOperationOptions {
  skipErrors?: boolean
  maxRetries?: number
  onProgress?: (progress: number) => void
  onError?: (error: StoreError) => void
}

// 导入/导出选项
export interface ImportExportOptions {
  format?: 'json' | 'csv' | 'xlsx'
  includeMetadata?: boolean
  preserveStructure?: boolean
  overwriteExisting?: boolean
}

// Store 初始化选项
export interface StoreInitOptions {
  autoLoad?: boolean
  persistState?: boolean
  enableDevtools?: boolean
}

// 状态同步选项
export interface StateSyncOptions {
  debounceMs?: number
  syncToServer?: boolean
  conflictResolution?: 'client' | 'server' | 'merge'
}

// 翻译统计信息
export interface TranslationStatistics {
  totalKeys: number
  translatedKeys: number
  untranslatedKeys: number
  progressPercentage: number
  languageStats: Record<
    string,
    {
      translated: number
      total: number
      percentage: number
    }
  >
}

// 搜索和筛选选项
export interface SearchFilterOptions {
  query?: string
  languages?: string[]
  namespaces?: string[]
  showOnlyUntranslated?: boolean
  showOnlyModified?: boolean
  keyPattern?: RegExp
}

// 验证规则
export interface ValidationRule {
  name: string
  description: string
  validate: (entry: TranslationEntry) => boolean
  severity: 'error' | 'warning' | 'info'
}

// 自动保存配置
export interface AutoSaveConfig {
  enabled: boolean
  intervalMs: number
  maxPendingChanges: number
  onSaveSuccess?: () => void
  onSaveError?: (error: StoreError) => void
}
