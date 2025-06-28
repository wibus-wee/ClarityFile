// 标签相关输入类型
export interface CreateTagInput {
  name: string
  color?: string
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
