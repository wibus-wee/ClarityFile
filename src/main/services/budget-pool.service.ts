import { db } from '../db'
import { budgetPools, expenseTrackings } from '../../db/schema'
import { eq, desc, sum, and, inArray } from 'drizzle-orm'
import {
  validateCreateBudgetPool,
  validateUpdateBudgetPool,
  validateDeleteBudgetPool,
  validateGetProjectBudgetPools,
  validateGetBudgetPool,
  type CreateBudgetPoolInput,
  type UpdateBudgetPoolInput,
  type DeleteBudgetPoolInput,
  type GetProjectBudgetPoolsInput,
  type GetBudgetPoolInput,
  type BudgetPoolOutput,
  type ProjectBudgetOverview,
  type BudgetPoolStatistics
} from '../types/budget-pool-schemas'

/**
 * 经费池服务
 * 负责经费池的CRUD操作和预算管理
 */
export class BudgetPoolService {
  /**
   * 获取项目的所有经费池
   */
  static async getProjectBudgetPools(
    input: GetProjectBudgetPoolsInput
  ): Promise<BudgetPoolOutput[]> {
    const validatedInput = validateGetProjectBudgetPools(input)

    const pools = await db
      .select()
      .from(budgetPools)
      .where(eq(budgetPools.projectId, validatedInput.projectId))
      .orderBy(desc(budgetPools.createdAt))

    // 为每个经费池计算统计信息
    const poolsWithStats = await Promise.all(
      pools.map(async (pool) => {
        const statistics = await this.getBudgetPoolStatistics(pool.id)
        return {
          ...pool,
          statistics
        }
      })
    )

    return poolsWithStats
  }

  /**
   * 获取经费池详情
   */
  static async getBudgetPool(input: GetBudgetPoolInput): Promise<BudgetPoolOutput | null> {
    const validatedInput = validateGetBudgetPool(input)

    const pool = await db
      .select()
      .from(budgetPools)
      .where(eq(budgetPools.id, validatedInput.id))
      .limit(1)

    if (!pool[0]) {
      return null
    }

    const statistics = await this.getBudgetPoolStatistics(validatedInput.id)

    return {
      ...pool[0],
      statistics
    }
  }

  /**
   * 创建经费池
   */
  static async createBudgetPool(input: CreateBudgetPoolInput): Promise<BudgetPoolOutput> {
    const validatedInput = validateCreateBudgetPool(input)

    const result = await db
      .insert(budgetPools)
      .values({
        name: validatedInput.name,
        projectId: validatedInput.projectId,
        budgetAmount: validatedInput.budgetAmount,
        description: validatedInput.description
      })
      .returning()

    console.log(`经费池 "${validatedInput.name}" 创建成功`)

    const statistics = await this.getBudgetPoolStatistics(result[0].id)

    return {
      ...result[0],
      statistics
    }
  }

  /**
   * 更新经费池
   */
  static async updateBudgetPool(input: UpdateBudgetPoolInput): Promise<BudgetPoolOutput> {
    const validatedInput = validateUpdateBudgetPool(input)

    const updateData: any = {
      updatedAt: new Date()
    }

    if (validatedInput.name !== undefined) updateData.name = validatedInput.name
    if (validatedInput.budgetAmount !== undefined)
      updateData.budgetAmount = validatedInput.budgetAmount
    if (validatedInput.description !== undefined)
      updateData.description = validatedInput.description

    const result = await db
      .update(budgetPools)
      .set(updateData)
      .where(eq(budgetPools.id, validatedInput.id))
      .returning()

    if (!result[0]) {
      throw new Error('经费池不存在')
    }

    console.log(`经费池 "${validatedInput.id}" 更新成功`)

    const statistics = await this.getBudgetPoolStatistics(validatedInput.id)

    return {
      ...result[0],
      statistics
    }
  }

  /**
   * 删除经费池
   */
  static async deleteBudgetPool(input: DeleteBudgetPoolInput): Promise<{ success: boolean }> {
    const validatedInput = validateDeleteBudgetPool(input)

    // 检查是否有关联的经费记录
    const relatedExpenses = await db
      .select()
      .from(expenseTrackings)
      .where(eq(expenseTrackings.budgetPoolId, validatedInput.id))
      .limit(1)

    if (relatedExpenses.length > 0) {
      throw new Error('无法删除经费池：存在关联的经费记录')
    }

    await db.delete(budgetPools).where(eq(budgetPools.id, validatedInput.id))

    console.log(`经费池 "${validatedInput.id}" 删除成功`)

    return { success: true }
  }

  /**
   * 获取经费池统计信息
   */
  static async getBudgetPoolStatistics(budgetPoolId: string): Promise<BudgetPoolStatistics> {
    // 获取经费池信息
    const pool = await db
      .select()
      .from(budgetPools)
      .where(eq(budgetPools.id, budgetPoolId))
      .limit(1)

    if (!pool[0]) {
      throw new Error('经费池不存在')
    }

    // 计算已使用金额（只包含已批准和已报销的记录）
    const usedAmountResult = await db
      .select({
        total: sum(expenseTrackings.amount)
      })
      .from(expenseTrackings)
      .where(
        and(
          eq(expenseTrackings.budgetPoolId, budgetPoolId),
          // 只计算已批准和已报销的记录
          inArray(expenseTrackings.status, ['approved', 'reimbursed'])
        )
      )

    // 计算经费记录数量
    const expenseCountResult = await db
      .select()
      .from(expenseTrackings)
      .where(eq(expenseTrackings.budgetPoolId, budgetPoolId))

    const totalBudget = pool[0].budgetAmount
    const usedAmount = Number(usedAmountResult[0]?.total || 0)
    const remainingAmount = totalBudget - usedAmount
    const expenseCount = expenseCountResult.length
    const utilizationRate = totalBudget > 0 ? (usedAmount / totalBudget) * 100 : 0

    return {
      totalBudget,
      usedAmount,
      remainingAmount,
      expenseCount,
      utilizationRate
    }
  }

  /**
   * 获取项目经费概览
   */
  static async getProjectBudgetOverview(projectId: string): Promise<ProjectBudgetOverview> {
    // 获取项目的所有经费池
    const budgetPoolsData = await this.getProjectBudgetPools({ projectId })

    // 计算总预算（所有经费池预算之和）
    const totalBudget = budgetPoolsData.reduce((sum, pool) => sum + pool.budgetAmount, 0)

    // 计算已使用预算（所有经费池已使用金额之和）
    const usedBudget = budgetPoolsData.reduce(
      (sum, pool) => sum + (pool.statistics?.usedAmount || 0),
      0
    )

    // 整体使用率
    const utilizationRate = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0

    return {
      projectId,
      totalBudget,
      allocatedBudget: totalBudget, // 在这个架构中，分配预算等于总预算
      remainingBudget: totalBudget - usedBudget,
      usedBudget,
      budgetPools: budgetPoolsData,
      utilizationRate
    }
  }
}
