import { z } from 'zod'

// ===== 资产管理相关 Schema =====

// 资产类型枚举
export const assetTypeSchema = z.enum([
  '图片',
  '视频',
  '音频',
  '文档',
  '代码',
  '数据',
  '模型',
  '其他'
], {
  errorMap: () => ({ message: '请选择有效的资产类型' })
})

// 创建项目资产 Schema
export const createProjectAssetSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  name: z
    .string()
    .min(1, '资产名称不能为空')
    .max(100, '资产名称不能超过100个字符')
    .refine((name) => name.trim().length > 0, '资产名称不能只包含空格'),
  assetType: assetTypeSchema,
  contextDescription: z
    .string()
    .max(500, '上下文描述不能超过500个字符')
    .optional(),
  versionInfo: z
    .string()
    .max(100, '版本信息不能超过100个字符')
    .optional(),
  customFields: z.record(z.any()).optional(),
  managedFileId: z.string().min(1, '受管文件ID不能为空')
})

// 更新项目资产 Schema
export const updateProjectAssetSchema = z.object({
  id: z.string().min(1, '资产ID不能为空'),
  name: z
    .string()
    .min(1, '资产名称不能为空')
    .max(100, '资产名称不能超过100个字符')
    .refine((name) => name.trim().length > 0, '资产名称不能只包含空格')
    .optional(),
  assetType: assetTypeSchema.optional(),
  contextDescription: z
    .string()
    .max(500, '上下文描述不能超过500个字符')
    .optional(),
  versionInfo: z
    .string()
    .max(100, '版本信息不能超过100个字符')
    .optional(),
  customFields: z.record(z.any()).optional()
})

// 获取项目资产 Schema
export const getProjectAssetSchema = z.object({
  id: z.string().min(1, '资产ID不能为空')
})

// 删除项目资产 Schema
export const deleteProjectAssetSchema = z.object({
  id: z.string().min(1, '资产ID不能为空')
})

// 获取项目资产列表 Schema
export const getProjectAssetsSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空')
})

// 设置项目封面资产 Schema
export const setProjectCoverAssetSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  assetId: z.string().min(1, '资产ID不能为空')
})

// 移除项目封面资产 Schema
export const removeProjectCoverAssetSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空')
})

// 批量删除项目资产 Schema
export const batchDeleteProjectAssetsSchema = z.object({
  assetIds: z.array(z.string().min(1, '资产ID不能为空')).min(1, '至少选择一个资产')
})

// 搜索项目资产 Schema
export const searchProjectAssetsSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  query: z.string().min(1, '搜索关键词不能为空'),
  assetType: assetTypeSchema.optional()
})

// ===== 类型推导 =====

// 项目资产输入类型
export type CreateProjectAssetInput = z.infer<typeof createProjectAssetSchema>
export type UpdateProjectAssetInput = z.infer<typeof updateProjectAssetSchema>
export type GetProjectAssetInput = z.infer<typeof getProjectAssetSchema>
export type DeleteProjectAssetInput = z.infer<typeof deleteProjectAssetSchema>
export type GetProjectAssetsInput = z.infer<typeof getProjectAssetsSchema>
export type SetProjectCoverAssetInput = z.infer<typeof setProjectCoverAssetSchema>
export type RemoveProjectCoverAssetInput = z.infer<typeof removeProjectCoverAssetSchema>
export type BatchDeleteProjectAssetsInput = z.infer<typeof batchDeleteProjectAssetsSchema>
export type SearchProjectAssetsInput = z.infer<typeof searchProjectAssetsSchema>

// 枚举类型
export type AssetType = z.infer<typeof assetTypeSchema>

// ===== 验证函数 =====

// 项目资产验证函数
export function validateCreateProjectAsset(input: unknown): CreateProjectAssetInput {
  return createProjectAssetSchema.parse(input)
}

export function validateUpdateProjectAsset(input: unknown): UpdateProjectAssetInput {
  return updateProjectAssetSchema.parse(input)
}

export function validateGetProjectAsset(input: unknown): GetProjectAssetInput {
  return getProjectAssetSchema.parse(input)
}

export function validateDeleteProjectAsset(input: unknown): DeleteProjectAssetInput {
  return deleteProjectAssetSchema.parse(input)
}

export function validateGetProjectAssets(input: unknown): GetProjectAssetsInput {
  return getProjectAssetsSchema.parse(input)
}

export function validateSetProjectCoverAsset(input: unknown): SetProjectCoverAssetInput {
  return setProjectCoverAssetSchema.parse(input)
}

export function validateRemoveProjectCoverAsset(input: unknown): RemoveProjectCoverAssetInput {
  return removeProjectCoverAssetSchema.parse(input)
}

export function validateBatchDeleteProjectAssets(input: unknown): BatchDeleteProjectAssetsInput {
  return batchDeleteProjectAssetsSchema.parse(input)
}

export function validateSearchProjectAssets(input: unknown): SearchProjectAssetsInput {
  return searchProjectAssetsSchema.parse(input)
}

// ===== 输出类型 =====

// 基础项目资产输出类型
export interface ProjectAssetOutput {
  id: string
  projectId: string
  name: string
  assetType: AssetType
  contextDescription?: string | null
  versionInfo?: string | null
  customFields?: Record<string, any> | null
  createdAt: Date
  updatedAt: Date
  // 文件信息（从 managedFiles 表关联）
  managedFileId: string
  fileName: string
  originalFileName: string
  physicalPath: string
  mimeType?: string | null
  fileSizeBytes?: number | null
  uploadedAt: Date
}

// 项目资产统计信息
export interface ProjectAssetStatsOutput {
  totalAssets: number
  assetsByType: Record<AssetType, number>
  totalFileSize: number
  recentAssets: number // 最近7天创建的资产数量
}

// 成功响应类型
export interface SuccessResponse {
  success: boolean
  message?: string
}
