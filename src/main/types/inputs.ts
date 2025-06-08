// 标签相关输入类型
export interface CreateTagInput {
  name: string
  color?: string
}

// 经费追踪相关输入类型
export interface CreateExpenseTrackingInput {
  itemName: string
  projectId: string
  applicant: string
  amount: number
  applicationDate: Date
  status: string
  invoiceManagedFileId?: string
  reimbursementDate?: Date
  notes?: string
}

export interface UpdateExpenseTrackingInput {
  id: string
  itemName?: string
  applicant?: string
  amount?: number
  applicationDate?: Date
  status?: string
  invoiceManagedFileId?: string
  reimbursementDate?: Date
  notes?: string
}

export interface DeleteExpenseTrackingInput {
  id: string
}

export interface GetProjectExpensesInput {
  projectId: string
}

// 共享资源相关输入类型
export interface CreateSharedResourceInput {
  name: string
  type: string
  managedFileId: string
  description?: string
  customFields?: unknown
}

export interface UpdateSharedResourceInput {
  id: string
  name?: string
  type?: string
  description?: string
  customFields?: unknown
}

export interface DeleteSharedResourceInput {
  id: string
}

export interface AssociateResourceToProjectInput {
  projectId: string
  sharedResourceId: string
  usageDescription?: string
}

export interface DisassociateResourceFromProjectInput {
  projectId: string
  sharedResourceId: string
}

export interface GetProjectSharedResourcesInput {
  projectId: string
}

// 设置相关输入类型
export interface GetSettingsByCategoryInput {
  category: string
}

export interface GetSettingInput {
  key: string
}

export interface SetSettingInput {
  key: string
  value: any
  category: string
  description?: string
  isUserModifiable?: boolean
}

export interface SetSettingsInput extends Array<SetSettingInput> {}

export interface DeleteSettingInput {
  key: string
}

export interface ResetSettingsInput {
  category?: string
}

// 文件系统相关输入类型
export interface SelectDirectoryInput {
  title?: string
  defaultPath?: string
}

export interface SelectFileInput {
  title?: string
  defaultPath?: string
  filters?: Array<{ name: string; extensions: string[] }>
}

// 窗口相关输入类型
export interface WindowBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface WindowState {
  isMaximized: boolean
  isMinimized: boolean
  isFullScreen: boolean
}

export interface WindowConfig {
  bounds: WindowBounds
  state: WindowState
  displayId?: number // 用于多显示器支持
}
