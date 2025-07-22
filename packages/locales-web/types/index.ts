/**
 * 类型定义入口文件
 * 统一导出所有类型定义
 */

// 翻译相关类型
export type {
  Language,
  Namespace,
  TranslationEntry,
  TranslationValue,
  TranslationFile,
  TranslationProgress,
  TranslationStats,
  SearchOptions,
  FilterOptions,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ExportOptions,
  ImportOptions
} from './translation'

// API 相关类型（保留核心类型）
export type { ApiResponse, SaveTranslationRequest, ApiError, ApiRequestConfig } from './api'

// UI 组件相关类型（保留核心配置类型）
export type { ThemeConfig, LayoutConfig } from './ui'

// Pinia Stores 相关类型
export type {
  TranslationsState,
  SettingsState,
  FileSystemState,
  NamespaceInfo,
  AppSettings,
  StoreActionResult,
  TranslationOperationResult,
  FileOperationResult,
  StoreError,
  BatchOperationOptions,
  ImportExportOptions,
  StoreInitOptions,
  StateSyncOptions,
  TranslationStatistics,
  SearchFilterOptions,
  ValidationRule,
  AutoSaveConfig
} from './stores'
