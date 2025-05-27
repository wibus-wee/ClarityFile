// 项目相关输入类型
export interface CreateProjectInput {
  name: string
  description?: string
  status?: string
}

export interface UpdateProjectInput {
  id: string
  name?: string
  description?: string
  status?: string
}

export interface GetProjectInput {
  id: string
}

export interface DeleteProjectInput {
  id: string
}

export interface SearchProjectsInput {
  query: string
}

export interface SyncProjectFolderPathInput {
  projectId: string
}

export interface RepairProjectFolderInput {
  projectId: string
}

// 文档相关输入类型
export interface GetProjectDocumentsInput {
  projectId: string
}

export interface CreateLogicalDocumentInput {
  projectId: string
  name: string
  type: string
  description?: string
  defaultStoragePathSegment?: string
}

// 标签相关输入类型
export interface CreateTagInput {
  name: string
  color?: string
}

// 文件相关输入类型
export interface GetManagedFilesInput {
  limit?: number
  offset?: number
}

export interface CreateManagedFileInput {
  name: string
  physicalPath: string
  fileHash?: string
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
