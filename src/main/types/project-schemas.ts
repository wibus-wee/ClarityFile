import { z } from 'zod'

// ===== 项目管理相关 Schema =====

// 项目状态枚举
export const projectStatusSchema = z.enum(['active', 'on_hold', 'archived'], {
  errorMap: () => ({ message: '项目状态必须是 active、on_hold 或 archived' })
})

// 创建项目 Schema
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, '项目名称不能为空')
    .max(100, '项目名称不能超过100个字符')
    .refine((name) => name.trim().length > 0, '项目名称不能只包含空格'),
  description: z.string().max(500, '项目描述不能超过500个字符').optional(),
  status: projectStatusSchema.optional().default('active')
})

// 更新项目 Schema
export const updateProjectSchema = z.object({
  id: z.string().min(1, '项目ID不能为空'),
  name: z
    .string()
    .min(1, '项目名称不能为空')
    .max(100, '项目名称不能超过100个字符')
    .refine((name) => name.trim().length > 0, '项目名称不能只包含空格')
    .optional(),
  description: z.string().max(500, '项目描述不能超过500个字符').optional(),
  status: projectStatusSchema.optional(),
  currentCoverAssetId: z.string().nullable().optional()
})

// 获取项目 Schema
export const getProjectSchema = z.object({
  id: z.string().min(1, '项目ID不能为空')
})

// 删除项目 Schema
export const deleteProjectSchema = z.object({
  id: z.string().min(1, '项目ID不能为空')
})

// 搜索项目 Schema
export const searchProjectsSchema = z.object({
  query: z.string().min(1, '搜索关键词不能为空')
})

// 同步项目文件夹路径 Schema
export const syncProjectFolderPathSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空')
})

// 修复项目文件夹 Schema
export const repairProjectFolderSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空')
})

// ===== 项目设置相关 Schema =====

// 项目设置 Schema（用于设置页面）
export const projectSettingsSchema = z.object({
  name: z.string().min(1, '项目名称不能为空').max(100, '项目名称不能超过100个字符'),
  description: z.string().max(500, '项目描述不能超过500个字符').optional(),
  status: projectStatusSchema,
  currentCoverAssetId: z.string().nullable().optional()
})

// ===== 类型推导 =====

// 输入类型
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type GetProjectInput = z.infer<typeof getProjectSchema>
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>
export type SearchProjectsInput = z.infer<typeof searchProjectsSchema>
export type SyncProjectFolderPathInput = z.infer<typeof syncProjectFolderPathSchema>
export type RepairProjectFolderInput = z.infer<typeof repairProjectFolderSchema>
export type ProjectSettingsInput = z.infer<typeof projectSettingsSchema>

// 项目状态类型
export type ProjectStatus = z.infer<typeof projectStatusSchema>

// ===== 验证函数 =====

// 创建项目验证
export function validateCreateProject(input: unknown): CreateProjectInput {
  return createProjectSchema.parse(input)
}

// 更新项目验证
export function validateUpdateProject(input: unknown): UpdateProjectInput {
  return updateProjectSchema.parse(input)
}

// 获取项目验证
export function validateGetProject(input: unknown): GetProjectInput {
  return getProjectSchema.parse(input)
}

// 删除项目验证
export function validateDeleteProject(input: unknown): DeleteProjectInput {
  return deleteProjectSchema.parse(input)
}

// 搜索项目验证
export function validateSearchProjects(input: unknown): SearchProjectsInput {
  return searchProjectsSchema.parse(input)
}

// 同步项目文件夹路径验证
export function validateSyncProjectFolderPath(input: unknown): SyncProjectFolderPathInput {
  return syncProjectFolderPathSchema.parse(input)
}

// 修复项目文件夹验证
export function validateRepairProjectFolder(input: unknown): RepairProjectFolderInput {
  return repairProjectFolderSchema.parse(input)
}

// 项目设置验证
export function validateProjectSettings(input: unknown): ProjectSettingsInput {
  return projectSettingsSchema.parse(input)
}

// ===== 输出类型（从现有 outputs.ts 引用） =====

// 基础项目输出类型
export interface ProjectOutput {
  id: string
  name: string
  description?: string | null
  status: ProjectStatus
  folderPath?: string | null
  currentCoverAssetId?: string | null
  createdAt: Date
  updatedAt: Date
}

// 项目详情输出类型（聚合所有相关数据）
export interface ProjectDetailsOutput {
  project: ProjectOutput
  documents: any[] // 从 LogicalDocumentService 获取
  assets: any[] // 从 ProjectAssetsService 获取
  expenses: any[] // 从 ExpenseTrackingService 获取
  sharedResources: any[] // 从 SharedResourcesService 获取
  competitions: any[] // 从 CompetitionService 获取
  tags: any[] // 从 TagService 获取
  coverAsset?: any | null // 从 ProjectAssetsService 获取
  statistics: {
    documentCount: number
    versionCount: number
    assetCount: number
    expenseCount: number
    totalExpenseAmount: number
    sharedResourceCount: number
    competitionCount: number
    tagCount: number
  }
}

// 成功响应类型
export interface SuccessResponse {
  success: boolean
  message?: string
}
