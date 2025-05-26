// 项目相关组件的统一导出
export { ProjectForm } from './project-form'
export { ProjectCard } from './project-card'
export { ProjectSkeleton } from './project-skeleton'
export { ProjectEmptyState } from './project-empty-state'
export { CreateProjectDialog, EditProjectDialog } from './project-dialogs'

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
}
