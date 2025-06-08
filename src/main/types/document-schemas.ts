import { z } from 'zod'

// ===== 文档管理相关 Schema =====

// 文档状态枚举
export const documentStatusSchema = z.enum(['active', 'archived', 'deleted'], {
  errorMap: () => ({ message: '文档状态必须是 active、archived 或 deleted' })
})

// 文档类型 Schema - 使用字符串类型以支持自定义类型
export const documentTypeSchema = z
  .string()
  .min(1, '文档类型不能为空')
  .max(50, '文档类型不能超过50个字符')
  .refine((type) => type.trim().length > 0, '文档类型不能只包含空格')

// 常用文档类型选项（供前端 autocomplete 使用）
export const COMMON_DOCUMENT_TYPES = [
  { value: 'business_plan', label: '商业计划书', description: '项目商业计划书文档' },
  { value: 'presentation', label: 'PPT演示', description: '项目演示文稿' },
  { value: 'specification', label: '项目说明书', description: '项目技术或功能说明' },
  { value: 'meeting_minutes', label: '会议纪要', description: '项目会议记录文档' },
  { value: 'project_report', label: '项目报告', description: '项目相关报告文档' },
  { value: 'contract', label: '合同文档', description: '项目相关合同文件' },
  { value: 'requirements', label: '需求文档', description: '项目需求分析文档' },
  { value: 'design_doc', label: '设计文档', description: '项目设计方案文档' },
  { value: 'technical_doc', label: '技术文档', description: '技术实现相关文档' },
  { value: 'other', label: '其他', description: '其他类型文档' }
] as const

// 创建逻辑文档 Schema
export const createLogicalDocumentSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  name: z
    .string()
    .min(1, '文档名称不能为空')
    .max(100, '文档名称不能超过100个字符')
    .refine((name) => name.trim().length > 0, '文档名称不能只包含空格'),
  type: documentTypeSchema,
  description: z.string().max(500, '文档描述不能超过500个字符').optional(),
  defaultStoragePathSegment: z.string().max(200, '存储路径段不能超过200个字符').optional()
})

// 更新逻辑文档 Schema
export const updateLogicalDocumentSchema = z.object({
  id: z.string().min(1, '文档ID不能为空'),
  name: z
    .string()
    .min(1, '文档名称不能为空')
    .max(100, '文档名称不能超过100个字符')
    .refine((name) => name.trim().length > 0, '文档名称不能只包含空格')
    .optional(),
  type: documentTypeSchema.optional(),
  description: z.string().max(500, '文档描述不能超过500个字符').optional(),
  defaultStoragePathSegment: z.string().max(200, '存储路径段不能超过200个字符').optional(),
  status: documentStatusSchema.optional(),
  currentOfficialVersionId: z.string().nullable().optional()
})

// 获取逻辑文档 Schema
export const getLogicalDocumentSchema = z.object({
  id: z.string().min(1, '文档ID不能为空')
})

// 删除逻辑文档 Schema
export const deleteLogicalDocumentSchema = z.object({
  id: z.string().min(1, '文档ID不能为空')
})

// 获取项目文档 Schema
export const getProjectDocumentsSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空')
})

// ===== 文档版本相关 Schema =====

// 创建文档版本 Schema
export const createDocumentVersionSchema = z.object({
  logicalDocumentId: z.string().min(1, '逻辑文档ID不能为空'),
  managedFileId: z.string().min(1, '受管文件ID不能为空'),
  versionTag: z.string().min(1, '版本标签不能为空').max(50, '版本标签不能超过50个字符'),
  isGenericVersion: z.boolean().default(false),
  competitionMilestoneId: z.string().nullable().optional(),
  notes: z.string().max(1000, '备注不能超过1000个字符').optional()
})

// 更新文档版本 Schema
export const updateDocumentVersionSchema = z.object({
  id: z.string().min(1, '版本ID不能为空'),
  versionTag: z.string().min(1, '版本标签不能为空').max(50, '版本标签不能超过50个字符').optional(),
  isGenericVersion: z.boolean().optional(),
  competitionMilestoneId: z.string().nullable().optional(),
  notes: z.string().max(1000, '备注不能超过1000个字符').optional()
})

// 获取文档版本 Schema
export const getDocumentVersionSchema = z.object({
  id: z.string().min(1, '版本ID不能为空')
})

// 删除文档版本 Schema
export const deleteDocumentVersionSchema = z.object({
  id: z.string().min(1, '版本ID不能为空')
})

// 获取逻辑文档版本列表 Schema
export const getLogicalDocumentVersionsSchema = z.object({
  logicalDocumentId: z.string().min(1, '逻辑文档ID不能为空')
})

// 设置官方版本 Schema
export const setOfficialVersionSchema = z.object({
  logicalDocumentId: z.string().min(1, '逻辑文档ID不能为空'),
  versionId: z.string().min(1, '版本ID不能为空')
})

// ===== 类型推导 =====

// 逻辑文档输入类型
export type CreateLogicalDocumentInput = z.infer<typeof createLogicalDocumentSchema>
export type UpdateLogicalDocumentInput = z.infer<typeof updateLogicalDocumentSchema>
export type GetLogicalDocumentInput = z.infer<typeof getLogicalDocumentSchema>
export type DeleteLogicalDocumentInput = z.infer<typeof deleteLogicalDocumentSchema>
export type GetProjectDocumentsInput = z.infer<typeof getProjectDocumentsSchema>

// 文档版本输入类型
export type CreateDocumentVersionInput = z.infer<typeof createDocumentVersionSchema>
export type UpdateDocumentVersionInput = z.infer<typeof updateDocumentVersionSchema>
export type GetDocumentVersionInput = z.infer<typeof getDocumentVersionSchema>
export type DeleteDocumentVersionInput = z.infer<typeof deleteDocumentVersionSchema>
export type GetLogicalDocumentVersionsInput = z.infer<typeof getLogicalDocumentVersionsSchema>
export type SetOfficialVersionInput = z.infer<typeof setOfficialVersionSchema>

// 枚举类型
export type DocumentStatus = z.infer<typeof documentStatusSchema>
export type DocumentType = z.infer<typeof documentTypeSchema>

// ===== 验证函数 =====

// 逻辑文档验证函数
export function validateCreateLogicalDocument(input: unknown): CreateLogicalDocumentInput {
  return createLogicalDocumentSchema.parse(input)
}

export function validateUpdateLogicalDocument(input: unknown): UpdateLogicalDocumentInput {
  return updateLogicalDocumentSchema.parse(input)
}

export function validateGetLogicalDocument(input: unknown): GetLogicalDocumentInput {
  return getLogicalDocumentSchema.parse(input)
}

export function validateDeleteLogicalDocument(input: unknown): DeleteLogicalDocumentInput {
  return deleteLogicalDocumentSchema.parse(input)
}

export function validateGetProjectDocuments(input: unknown): GetProjectDocumentsInput {
  return getProjectDocumentsSchema.parse(input)
}

// 文档版本验证函数
export function validateCreateDocumentVersion(input: unknown): CreateDocumentVersionInput {
  return createDocumentVersionSchema.parse(input)
}

export function validateUpdateDocumentVersion(input: unknown): UpdateDocumentVersionInput {
  return updateDocumentVersionSchema.parse(input)
}

export function validateGetDocumentVersion(input: unknown): GetDocumentVersionInput {
  return getDocumentVersionSchema.parse(input)
}

export function validateDeleteDocumentVersion(input: unknown): DeleteDocumentVersionInput {
  return deleteDocumentVersionSchema.parse(input)
}

export function validateGetLogicalDocumentVersions(
  input: unknown
): GetLogicalDocumentVersionsInput {
  return getLogicalDocumentVersionsSchema.parse(input)
}

export function validateSetOfficialVersion(input: unknown): SetOfficialVersionInput {
  return setOfficialVersionSchema.parse(input)
}

// ===== 输出类型（从现有 outputs.ts 引用） =====

// 基础逻辑文档输出类型
export interface LogicalDocumentOutput {
  id: string
  projectId: string
  name: string
  type: DocumentType
  description?: string | null
  defaultStoragePathSegment?: string | null
  status: DocumentStatus
  currentOfficialVersionId?: string | null
  createdAt: Date
  updatedAt: Date
}

// 文档版本输出类型
export interface DocumentVersionOutput {
  id: string
  logicalDocumentId: string
  managedFileId: string
  versionTag: string
  isGenericVersion: boolean
  competitionMilestoneId?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  // 文件信息（从 managedFiles 表关联）
  fileName: string
  originalFileName: string
  physicalPath: string
  mimeType?: string | null
  fileSizeBytes?: number | null
  uploadedAt: Date
  // 赛事信息（从 competitionMilestones 表关联）
  competitionMilestone?: {
    id: string
    levelName: string
    dueDate?: Date | null
    series: {
      id: string
      name: string
    }
  } | null
}

// 带版本信息的逻辑文档输出类型
export interface LogicalDocumentWithVersionsOutput {
  id: string
  projectId: string
  name: string
  type: DocumentType
  description?: string | null
  defaultStoragePathSegment?: string | null
  status: DocumentStatus
  currentOfficialVersionId?: string | null
  createdAt: Date
  updatedAt: Date
  versions: DocumentVersionOutput[]
}

// 成功响应类型
export interface SuccessResponse {
  success: boolean
  message?: string
}
