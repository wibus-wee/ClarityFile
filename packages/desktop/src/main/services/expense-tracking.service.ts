import { db } from '../db'
import { expenseTrackings, managedFiles, budgetPools, projects } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import type {
  CreateExpenseTrackingInput,
  UpdateExpenseTrackingInput
} from '../types/expense-schemas'

/**
 * 经费追踪服务
 * 负责经费记录的CRUD操作和业务逻辑
 */
export class ExpenseTrackingService {
  /**
   * 获取项目的所有经费记录
   */
  static async getProjectExpenses(projectId: string) {
    const expenses = await db
      .select({
        id: expenseTrackings.id,
        itemName: expenseTrackings.itemName,
        projectId: expenseTrackings.projectId,
        budgetPoolId: expenseTrackings.budgetPoolId,
        applicant: expenseTrackings.applicant,
        amount: expenseTrackings.amount,
        applicationDate: expenseTrackings.applicationDate,
        status: expenseTrackings.status,
        reimbursementDate: expenseTrackings.reimbursementDate,
        notes: expenseTrackings.notes,
        createdAt: expenseTrackings.createdAt,
        updatedAt: expenseTrackings.updatedAt,
        // 发票文件信息（可能为空）
        invoiceFileName: managedFiles.name,
        invoiceOriginalFileName: managedFiles.originalFileName,
        invoicePhysicalPath: managedFiles.physicalPath,
        invoiceMimeType: managedFiles.mimeType,
        invoiceFileSizeBytes: managedFiles.fileSizeBytes,
        invoiceUploadedAt: managedFiles.uploadedAt
      })
      .from(expenseTrackings)
      .leftJoin(managedFiles, eq(expenseTrackings.invoiceManagedFileId, managedFiles.id))
      .where(eq(expenseTrackings.projectId, projectId))
      .orderBy(desc(expenseTrackings.applicationDate))

    return expenses
  }

  /**
   * 创建经费记录
   */
  static async createExpenseTracking(input: CreateExpenseTrackingInput) {
    // 验证经费池是否属于指定项目
    const budgetPool = await db
      .select()
      .from(budgetPools)
      .where(eq(budgetPools.id, input.budgetPoolId))
      .limit(1)

    if (!budgetPool[0]) {
      throw new Error('指定的经费池不存在')
    }

    if (budgetPool[0].projectId !== input.projectId) {
      throw new Error('经费池不属于指定的项目')
    }

    const result = await db
      .insert(expenseTrackings)
      .values({
        itemName: input.itemName,
        projectId: input.projectId,
        budgetPoolId: input.budgetPoolId,
        applicant: input.applicant,
        amount: input.amount,
        applicationDate: input.applicationDate,
        status: input.status,
        invoiceManagedFileId: input.invoiceManagedFileId,
        reimbursementDate: input.reimbursementDate,
        notes: input.notes
      })
      .returning()

    console.log(`经费记录 "${input.itemName}" 创建成功`)
    return result[0]
  }

  /**
   * 更新经费记录
   */
  static async updateExpenseTracking(input: UpdateExpenseTrackingInput) {
    // 先获取当前经费记录的信息
    const currentRecord = await db
      .select({
        projectId: expenseTrackings.projectId,
        budgetPoolId: expenseTrackings.budgetPoolId
      })
      .from(expenseTrackings)
      .where(eq(expenseTrackings.id, input.id))
      .limit(1)

    if (!currentRecord[0]) {
      throw new Error('经费记录不存在')
    }

    // 确定最终的项目ID（如果更新了项目，使用新项目ID，否则使用当前项目ID）
    const finalProjectId =
      input.projectId !== undefined ? input.projectId : currentRecord[0].projectId

    // 如果更新了项目，验证新项目是否存在
    if (input.projectId !== undefined && input.projectId !== currentRecord[0].projectId) {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1)

      if (!project[0]) {
        throw new Error('指定的项目不存在')
      }
    }

    // 验证经费池的逻辑
    if (input.budgetPoolId !== undefined) {
      // 验证新的经费池是否存在
      const budgetPool = await db
        .select()
        .from(budgetPools)
        .where(eq(budgetPools.id, input.budgetPoolId))
        .limit(1)

      if (!budgetPool[0]) {
        throw new Error('指定的经费池不存在')
      }

      // 验证经费池是否属于最终的项目
      if (budgetPool[0].projectId !== finalProjectId) {
        throw new Error('经费池不属于指定的项目')
      }
    } else if (input.projectId !== undefined && input.projectId !== currentRecord[0].projectId) {
      // 如果更新了项目但没有更新经费池，需要验证当前经费池是否属于新项目
      if (currentRecord[0].budgetPoolId) {
        const currentBudgetPool = await db
          .select()
          .from(budgetPools)
          .where(eq(budgetPools.id, currentRecord[0].budgetPoolId))
          .limit(1)

        if (currentBudgetPool[0] && currentBudgetPool[0].projectId !== finalProjectId) {
          throw new Error('当前经费池不属于新项目，请同时更新经费池')
        }
      }
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (input.projectId !== undefined) updateData.projectId = input.projectId
    if (input.itemName !== undefined) updateData.itemName = input.itemName
    if (input.budgetPoolId !== undefined) updateData.budgetPoolId = input.budgetPoolId
    if (input.applicant !== undefined) updateData.applicant = input.applicant
    if (input.amount !== undefined) updateData.amount = input.amount
    if (input.applicationDate !== undefined) updateData.applicationDate = input.applicationDate
    if (input.status !== undefined) updateData.status = input.status
    if (input.invoiceManagedFileId !== undefined)
      updateData.invoiceManagedFileId = input.invoiceManagedFileId
    if (input.reimbursementDate !== undefined)
      updateData.reimbursementDate = input.reimbursementDate
    if (input.notes !== undefined) updateData.notes = input.notes

    const result = await db
      .update(expenseTrackings)
      .set(updateData)
      .where(eq(expenseTrackings.id, input.id))
      .returning()

    console.log(`经费记录 "${input.id}" 更新成功`)
    return result[0]
  }

  /**
   * 删除经费记录
   */
  static async deleteExpenseTracking(id: string) {
    await db.delete(expenseTrackings).where(eq(expenseTrackings.id, id)).returning()

    console.log(`经费记录 "${id}" 删除成功`)
    return { success: true }
  }

  /**
   * 获取项目经费统计信息
   */
  static async getProjectExpensesStatistics(projectId: string) {
    const expenses = await this.getProjectExpenses(projectId)

    // 计算所有报销记录的总金额（用于统计目的）
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    // 计算实际已使用的经费（只包含已批准和已报销的记录）
    const usedAmount = expenses
      .filter((expense) => expense.status === 'approved' || expense.status === 'reimbursed')
      .reduce((sum, expense) => sum + expense.amount, 0)

    // 按状态分别计算金额
    const statusAmounts = expenses.reduce(
      (acc, expense) => {
        acc[expense.status] = (acc[expense.status] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>
    )

    const statusCounts = expenses.reduce(
      (acc, expense) => {
        acc[expense.status] = (acc[expense.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      expenseCount: expenses.length,
      totalExpenseAmount: totalAmount, // 所有报销记录的总金额
      usedExpenseAmount: usedAmount, // 实际已使用的经费（已批准+已报销）
      statusBreakdown: statusCounts,
      statusAmounts: statusAmounts, // 按状态分组的金额
      averageAmount: expenses.length > 0 ? totalAmount / expenses.length : 0
    }
  }

  /**
   * 获取所有经费记录（不限项目）
   */
  static async getAllExpenses() {
    const expenses = await db
      .select({
        id: expenseTrackings.id,
        itemName: expenseTrackings.itemName,
        projectId: expenseTrackings.projectId,
        budgetPoolId: expenseTrackings.budgetPoolId,
        applicant: expenseTrackings.applicant,
        amount: expenseTrackings.amount,
        applicationDate: expenseTrackings.applicationDate,
        status: expenseTrackings.status,
        reimbursementDate: expenseTrackings.reimbursementDate,
        notes: expenseTrackings.notes,
        createdAt: expenseTrackings.createdAt,
        updatedAt: expenseTrackings.updatedAt,
        // 发票文件信息（可能为空）
        invoiceFileName: managedFiles.name,
        invoiceOriginalFileName: managedFiles.originalFileName,
        invoicePhysicalPath: managedFiles.physicalPath,
        invoiceMimeType: managedFiles.mimeType,
        invoiceFileSizeBytes: managedFiles.fileSizeBytes,
        invoiceUploadedAt: managedFiles.uploadedAt
      })
      .from(expenseTrackings)
      .leftJoin(managedFiles, eq(expenseTrackings.invoiceManagedFileId, managedFiles.id))
      .orderBy(desc(expenseTrackings.applicationDate))

    return expenses
  }

  /**
   * 根据状态获取经费记录
   */
  static async getExpensesByStatus(status: string) {
    const expenses = await db
      .select()
      .from(expenseTrackings)
      .where(eq(expenseTrackings.status, status))
      .orderBy(desc(expenseTrackings.applicationDate))

    return expenses
  }
}
