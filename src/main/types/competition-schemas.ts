import { z } from 'zod'

// ============================================================================
// 赛事管理 Zod Schema 定义
// ============================================================================

// 基础字段验证
const competitionSeriesIdSchema = z.string().min(1, '赛事系列ID不能为空')
const competitionMilestoneIdSchema = z.string().min(1, '里程碑ID不能为空')
const projectIdSchema = z.string().min(1, '项目ID不能为空')

// ============================================================================
// 输入 Schema (Input Schemas)
// ============================================================================

// 赛事系列相关
export const createCompetitionSeriesSchema = z.object({
  name: z.string().min(1, '赛事系列名称不能为空').max(100, '赛事系列名称不能超过100个字符'),
  notes: z.string().max(500, '备注不能超过500个字符').optional(),
  customFields: z.unknown().optional()
})

export const updateCompetitionSeriesSchema = z.object({
  id: competitionSeriesIdSchema,
  name: z
    .string()
    .min(1, '赛事系列名称不能为空')
    .max(100, '赛事系列名称不能超过100个字符')
    .optional(),
  notes: z.string().max(500, '备注不能超过500个字符').optional()
})

export const deleteCompetitionSeriesSchema = z.object({
  id: competitionSeriesIdSchema
})

// 赛事里程碑相关
export const createCompetitionMilestoneSchema = z.object({
  competitionSeriesId: competitionSeriesIdSchema,
  levelName: z.string().min(1, '里程碑名称不能为空').max(100, '里程碑名称不能超过100个字符'),
  dueDateMilestone: z.date().optional(),
  notes: z.string().max(500, '备注不能超过500个字符').optional(),
  notificationManagedFileId: z.string().optional(),
  customFields: z.unknown().optional()
})

export const updateCompetitionMilestoneSchema = z.object({
  id: competitionMilestoneIdSchema,
  levelName: z
    .string()
    .min(1, '里程碑名称不能为空')
    .max(100, '里程碑名称不能超过100个字符')
    .optional(),
  dueDateMilestone: z.date().optional(),
  notes: z.string().max(500, '备注不能超过500个字符').optional(),
  notificationManagedFileId: z.string().optional()
})

export const deleteCompetitionMilestoneSchema = z.object({
  id: competitionMilestoneIdSchema
})

// 项目参赛相关
export const addProjectToCompetitionSchema = z.object({
  projectId: projectIdSchema,
  competitionMilestoneId: competitionMilestoneIdSchema,
  statusInMilestone: z.string().max(50, '状态描述不能超过50个字符').optional()
})

export const updateProjectCompetitionStatusSchema = z.object({
  projectId: projectIdSchema,
  competitionMilestoneId: competitionMilestoneIdSchema,
  statusInMilestone: z.string().min(1, '状态不能为空').max(50, '状态描述不能超过50个字符')
})

export const removeProjectFromCompetitionSchema = z.object({
  projectId: projectIdSchema,
  competitionMilestoneId: competitionMilestoneIdSchema
})

// 查询相关
export const getProjectCompetitionsSchema = z.object({
  projectId: projectIdSchema
})

export const getCompetitionMilestonesSchema = z.object({
  seriesId: competitionSeriesIdSchema
})

export const getUpcomingMilestonesSchema = z.object({
  limit: z.number().int().positive().max(100).optional()
})

export const getMilestonesByDateRangeSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date()
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: '开始日期不能晚于结束日期',
    path: ['endDate']
  })

export const getMilestoneParticipatingProjectsSchema = z.object({
  milestoneId: competitionMilestoneIdSchema
})

// ============================================================================
// 输出 Schema (Output Schemas)
// ============================================================================

// 基础赛事系列输出
export const competitionSeriesOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// 带统计信息的赛事系列输出
export const competitionSeriesWithStatsOutputSchema = competitionSeriesOutputSchema.extend({
  milestoneCount: z.number().int().nonnegative()
})

// 赛事里程碑输出
export const competitionMilestoneOutputSchema = z.object({
  id: z.string(),
  competitionSeriesId: z.string(),
  levelName: z.string(),
  dueDate: z.date().nullable(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  participatingProjectsCount: z.number().int().nonnegative().optional(),
  notificationFileName: z.string().nullable().optional(),
  notificationOriginalFileName: z.string().nullable().optional(),
  notificationPhysicalPath: z.string().nullable().optional(),
  notificationMimeType: z.string().nullable().optional(),
  notificationFileSizeBytes: z.number().nullable().optional(),
  notificationUploadedAt: z.date().nullable().optional()
})

// 赛事概览输出
export const competitionOverviewOutputSchema = z.object({
  seriesWithStats: z.array(competitionSeriesWithStatsOutputSchema),
  totalStats: z.object({
    totalSeries: z.number().int().nonnegative(),
    totalMilestones: z.number().int().nonnegative(),
    totalParticipations: z.number().int().nonnegative()
  })
})

// 带项目信息的里程碑输出
export const milestoneWithProjectsOutputSchema = z.object({
  id: z.string(),
  levelName: z.string(),
  dueDate: z.date().nullable(),
  notes: z.string().nullable(),
  seriesId: z.string(),
  seriesName: z.string(),
  participatingProjectsCount: z.number().int().nonnegative()
})

// 赛事时间轴项目输出
export const competitionTimelineItemOutputSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  date: z.date().nullable(),
  description: z.string().nullable(),
  seriesId: z.string(),
  seriesName: z.string(),
  participatingProjectsCount: z.number().int().nonnegative()
})

// 里程碑参与项目输出
export const milestoneParticipatingProjectOutputSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  projectDescription: z.string().nullable(),
  statusInMilestone: z.string().nullable(),
  participatedAt: z.date(),
  projectCreatedAt: z.date(),
  projectUpdatedAt: z.date()
})

// ============================================================================
// TypeScript 类型导出 (从 Schema 推导)
// ============================================================================

// 输入类型
export type CreateCompetitionSeriesInput = z.infer<typeof createCompetitionSeriesSchema>
export type UpdateCompetitionSeriesInput = z.infer<typeof updateCompetitionSeriesSchema>
export type DeleteCompetitionSeriesInput = z.infer<typeof deleteCompetitionSeriesSchema>

export type CreateCompetitionMilestoneInput = z.infer<typeof createCompetitionMilestoneSchema>
export type UpdateCompetitionMilestoneInput = z.infer<typeof updateCompetitionMilestoneSchema>
export type DeleteCompetitionMilestoneInput = z.infer<typeof deleteCompetitionMilestoneSchema>

export type AddProjectToCompetitionInput = z.infer<typeof addProjectToCompetitionSchema>
export type UpdateProjectCompetitionStatusInput = z.infer<
  typeof updateProjectCompetitionStatusSchema
>
export type RemoveProjectFromCompetitionInput = z.infer<typeof removeProjectFromCompetitionSchema>

export type GetProjectCompetitionsInput = z.infer<typeof getProjectCompetitionsSchema>
export type GetCompetitionMilestonesInput = z.infer<typeof getCompetitionMilestonesSchema>
export type GetUpcomingMilestonesInput = z.infer<typeof getUpcomingMilestonesSchema>
export type GetMilestonesByDateRangeInput = z.infer<typeof getMilestonesByDateRangeSchema>
export type GetMilestoneParticipatingProjectsInput = z.infer<
  typeof getMilestoneParticipatingProjectsSchema
>

// 输出类型
export type CompetitionSeriesOutput = z.infer<typeof competitionSeriesOutputSchema>
export type CompetitionSeriesWithStatsOutput = z.infer<
  typeof competitionSeriesWithStatsOutputSchema
>
export type CompetitionMilestoneOutput = z.infer<typeof competitionMilestoneOutputSchema>
export type CompetitionOverviewOutput = z.infer<typeof competitionOverviewOutputSchema>
export type MilestoneWithProjectsOutput = z.infer<typeof milestoneWithProjectsOutputSchema>
export type CompetitionTimelineItemOutput = z.infer<typeof competitionTimelineItemOutputSchema>
export type MilestoneParticipatingProjectOutput = z.infer<
  typeof milestoneParticipatingProjectOutputSchema
>

// ============================================================================
// Schema 验证辅助函数
// ============================================================================

/**
 * 验证创建赛事系列输入
 */
export const validateCreateCompetitionSeries = (data: unknown) => {
  return createCompetitionSeriesSchema.parse(data)
}

/**
 * 验证更新赛事系列输入
 */
export const validateUpdateCompetitionSeries = (data: unknown) => {
  return updateCompetitionSeriesSchema.parse(data)
}

/**
 * 验证创建里程碑输入
 */
export const validateCreateCompetitionMilestone = (data: unknown) => {
  return createCompetitionMilestoneSchema.parse(data)
}

/**
 * 验证更新里程碑输入
 */
export const validateUpdateCompetitionMilestone = (data: unknown) => {
  return updateCompetitionMilestoneSchema.parse(data)
}

/**
 * 验证项目参赛输入
 */
export const validateAddProjectToCompetition = (data: unknown) => {
  return addProjectToCompetitionSchema.parse(data)
}

/**
 * 验证日期范围查询输入
 */
export const validateGetMilestonesByDateRange = (data: unknown) => {
  return getMilestonesByDateRangeSchema.parse(data)
}
