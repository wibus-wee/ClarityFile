// 项目相关组件的统一导出
export { ProjectCard } from './project-card'
export { ProjectSkeleton } from './project-skeleton'
export { ProjectEmptyState } from './project-empty-state'
export { ProjectDialog } from './project-dialog'

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
  createdAt: Date
  updatedAt: Date
}
