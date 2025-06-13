import { z } from 'zod'

// 基础验证Schema
export const budgetPoolIdSchema = z.string().min(1, '经费池ID不能为空')
export const projectIdSchema = z.string().min(1, '项目ID不能为空')
export const budgetAmountSchema = z.number().min(0, '预算金额不能为负数')

// 创建经费池的输入Schema
export const createBudgetPoolSchema = z.object({
  name: z.string().min(1, '经费池名称不能为空').max(100, '经费池名称不能超过100个字符'),
  projectId: projectIdSchema,
  budgetAmount: budgetAmountSchema,
  description: z.string().max(500, '描述不能超过500个字符').optional()
})

// 更新经费池的输入Schema
export const updateBudgetPoolSchema = z.object({
  id: budgetPoolIdSchema,
  name: z.string().min(1, '经费池名称不能为空').max(100, '经费池名称不能超过100个字符').optional(),
  budgetAmount: budgetAmountSchema.optional(),
  description: z.string().max(500, '描述不能超过500个字符').optional()
})

// 删除经费池的输入Schema
export const deleteBudgetPoolSchema = z.object({
  id: budgetPoolIdSchema
})

// 获取项目经费池的输入Schema
export const getProjectBudgetPoolsSchema = z.object({
  projectId: projectIdSchema
})

// 获取经费池详情的输入Schema
export const getBudgetPoolSchema = z.object({
  id: budgetPoolIdSchema
})

// 经费池统计信息Schema
export const budgetPoolStatisticsSchema = z.object({
  totalBudget: z.number(),
  usedAmount: z.number(),
  remainingAmount: z.number(),
  expenseCount: z.number(),
  utilizationRate: z.number() // 使用率百分比
})

// TypeScript类型定义
export type CreateBudgetPoolInput = z.infer<typeof createBudgetPoolSchema>
export type UpdateBudgetPoolInput = z.infer<typeof updateBudgetPoolSchema>
export type DeleteBudgetPoolInput = z.infer<typeof deleteBudgetPoolSchema>
export type GetProjectBudgetPoolsInput = z.infer<typeof getProjectBudgetPoolsSchema>
export type GetBudgetPoolInput = z.infer<typeof getBudgetPoolSchema>
export type BudgetPoolStatistics = z.infer<typeof budgetPoolStatisticsSchema>

// 经费池输出类型
export interface BudgetPoolOutput {
  id: string
  name: string
  projectId: string
  budgetAmount: number
  description?: string | null
  createdAt: Date
  updatedAt: Date
  // 统计信息
  statistics?: BudgetPoolStatistics
}

// 项目经费概览类型
export interface ProjectBudgetOverview {
  projectId: string
  totalBudget: number // 项目总预算
  allocatedBudget: number // 已分配给经费池的预算总额
  remainingBudget: number // 剩余可分配预算
  usedBudget: number // 实际已使用预算
  budgetPools: BudgetPoolOutput[]
  utilizationRate: number // 整体预算使用率
}

// 全局经费池输出类型（包含项目信息）
export interface GlobalBudgetPoolOutput extends BudgetPoolOutput {
  // 项目信息
  project: {
    id: string
    name: string
    status: string
  }
}

// 全局经费概览类型
export interface GlobalBudgetOverview {
  totalBudget: number // 所有项目总预算
  usedBudget: number // 所有项目已使用预算
  remainingBudget: number // 所有项目剩余预算
  utilizationRate: number // 全局预算使用率
  projectCount: number // 项目数量
  budgetPoolCount: number // 经费池总数
  budgetPools: GlobalBudgetPoolOutput[] // 所有经费池
  projectOverviews: ProjectBudgetOverview[] // 各项目概览
}

// 验证函数
export function validateCreateBudgetPool(input: unknown): CreateBudgetPoolInput {
  return createBudgetPoolSchema.parse(input)
}

export function validateUpdateBudgetPool(input: unknown): UpdateBudgetPoolInput {
  return updateBudgetPoolSchema.parse(input)
}

export function validateDeleteBudgetPool(input: unknown): DeleteBudgetPoolInput {
  return deleteBudgetPoolSchema.parse(input)
}

export function validateGetProjectBudgetPools(input: unknown): GetProjectBudgetPoolsInput {
  return getProjectBudgetPoolsSchema.parse(input)
}

export function validateGetBudgetPool(input: unknown): GetBudgetPoolInput {
  return getBudgetPoolSchema.parse(input)
}
