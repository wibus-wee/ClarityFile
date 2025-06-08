// 基础响应类型
export interface SuccessResponse {
  success: boolean
}

// 系统信息输出类型
export interface SystemInfoOutput {
  projectCount: number
  documentCount: number
  fileCount: number
  timestamp: string
}

// 文件选择输出类型
export interface SelectDirectoryOutput {
  canceled: boolean
  path: string | null
}

export interface SelectFileOutput {
  canceled: boolean
  path: string | null
  filePaths?: string[]
}

// 设置分类输出类型
export type SettingsCategoriesOutput = string[]

// 单独的文档版本类型
export interface DocumentVersionOutput {
  id: string
  versionTag: string
  isGenericVersion: boolean
  competitionMilestoneId: string | null
  competitionProjectName: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  fileName: string
  originalFileName: string
  physicalPath: string
  mimeType: string | null
  fileSizeBytes: number | null
  uploadedAt: Date
}

// 带版本的逻辑文档类型
export interface LogicalDocumentWithVersionsOutput {
  id: string
  name: string
  type: string
  description: string | null
  defaultStoragePathSegment: string | null
  status: string
  currentOfficialVersionId: string | null
  createdAt: Date
  updatedAt: Date
  versions: DocumentVersionOutput[]
}
