// 项目相关组件的统一导出
export { ProjectCard } from './project-card'
export { ProjectSkeleton } from './project-skeleton'
export { ProjectEmptyState } from './project-empty-state'
export { ProjectDrawer } from './project-drawer'
export { DeleteProjectDialog } from './delete-project-dialog'

// 类型定义
export interface ProjectFormData {
  name: string
  description: string
  status: string
}

export interface Project {
  id: string
  name: string
  description?: string | null
  status: string
  currentCoverAssetId?: string | null
  coverAsset?: {
    id: string
    name: string
    assetType: string
    contextDescription: string | null
    versionInfo: string | null
    customFields: Record<string, any> | null
    createdAt: Date
    updatedAt: Date
    fileName: string
    originalFileName: string
    physicalPath: string
    mimeType: string | null
    fileSizeBytes: number | null
    uploadedAt: Date
  } | null
  createdAt: Date
  updatedAt: Date
}
