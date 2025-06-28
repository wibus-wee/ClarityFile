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

// 设置分类输出类型
export type SettingsCategoriesOutput = string[]
