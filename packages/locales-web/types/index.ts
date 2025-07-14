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

// API 相关类型
export type {
  ApiResponse,
  PaginatedResponse,
  NamespaceApiResponse,
  LanguageApiResponse,
  TranslationFileApiResponse,
  SaveTranslationRequest,
  CreateLanguageRequest,
  CreateNamespaceRequest,
  ValidateTranslationRequest,
  ExportTranslationRequest,
  ImportTranslationRequest,
  SearchTranslationRequest,
  SearchTranslationResponse,
  FileSystemApiResponse,
  BackupApiResponse,
  RestoreBackupRequest,
  ApiError,
  ApiRequestConfig
} from './api'

// UI 组件相关类型
export type {
  ButtonProps,
  InputProps,
  SelectProps,
  SelectOption,
  ModalProps,
  TableColumn,
  TableProps,
  PaginationProps,
  ToastOptions,
  LoadingOptions,
  ConfirmOptions,
  ThemeConfig,
  LayoutConfig,
  KeyboardShortcut
} from './ui'

// 通用工具类型
export interface BaseEntity {
  /** 唯一标识 */
  id: string
  /** 创建时间 */
  createdAt?: Date
  /** 更新时间 */
  updatedAt?: Date
}

export interface Pagination {
  /** 当前页码 */
  page: number
  /** 每页大小 */
  pageSize: number
  /** 总数量 */
  total: number
}

export interface SortConfig {
  /** 排序字段 */
  field: string
  /** 排序方向 */
  direction: 'asc' | 'desc'
}

export interface FilterConfig {
  /** 筛选字段 */
  field: string
  /** 筛选操作符 */
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'nin'
  /** 筛选值 */
  value: any
}

export interface QueryConfig {
  /** 分页配置 */
  pagination?: Pagination
  /** 排序配置 */
  sort?: SortConfig[]
  /** 筛选配置 */
  filters?: FilterConfig[]
  /** 搜索关键词 */
  search?: string
}

// 事件类型
export interface BaseEvent {
  /** 事件类型 */
  type: string
  /** 事件时间戳 */
  timestamp: number
  /** 事件数据 */
  data?: any
}

export interface TranslationEvent extends BaseEvent {
  type: 'translation:updated' | 'translation:created' | 'translation:deleted'
  data: {
    namespace: string
    language: string
    keyPath: string
    oldValue?: any
    newValue?: any
  }
}

export interface LanguageEvent extends BaseEvent {
  type: 'language:added' | 'language:removed' | 'language:updated'
  data: {
    languageCode: string
    languageName?: string
    isBase?: boolean
  }
}

export interface NamespaceEvent extends BaseEvent {
  type: 'namespace:created' | 'namespace:deleted' | 'namespace:updated'
  data: {
    namespace: string
    displayName?: string
  }
}

// 状态类型
export interface AppState {
  /** 当前用户 */
  user?: User
  /** 应用设置 */
  settings: AppSettings
  /** UI 状态 */
  ui: UIState
}

export interface User {
  /** 用户 ID */
  id: string
  /** 用户名 */
  username: string
  /** 邮箱 */
  email?: string
  /** 角色 */
  role: 'admin' | 'editor' | 'viewer'
  /** 权限 */
  permissions: string[]
}

export interface AppSettings {
  /** 主题设置 */
  theme: ThemeConfig
  /** 布局设置 */
  layout: LayoutConfig
  /** 语言设置 */
  language: string
  /** 自动保存 */
  autoSave: boolean
  /** 自动保存间隔（秒） */
  autoSaveInterval: number
}

export interface UIState {
  /** 侧边栏是否展开 */
  sidebarExpanded: boolean
  /** 当前活跃的命名空间 */
  activeNamespace: string
  /** 当前选中的语言 */
  selectedLanguages: string[]
  /** 搜索查询 */
  searchQuery: string
  /** 筛选选项 */
  filterOptions: FilterOptions
  /** 加载状态 */
  loading: boolean
  /** 错误信息 */
  error?: string
}

// 配置类型
export interface AppConfig {
  /** API 基础 URL */
  apiBaseUrl: string
  /** 默认语言 */
  defaultLanguage: string
  /** 支持的语言列表 */
  supportedLanguages: Language[]
  /** 文件系统配置 */
  fileSystem: {
    /** 翻译文件目录 */
    translationDir: string
    /** 文件编码 */
    encoding: string
    /** 是否美化 JSON */
    prettyPrint: boolean
  }
  /** 编辑器配置 */
  editor: {
    /** 自动保存 */
    autoSave: boolean
    /** 自动保存间隔 */
    autoSaveInterval: number
    /** 显示行号 */
    showLineNumbers: boolean
    /** 语法高亮 */
    syntaxHighlight: boolean
  }
}
