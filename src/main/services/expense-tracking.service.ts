import { db } from '../db'
import { expenseTrackings, managedFiles } from '../../db/schema'
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
    const result = await db
      .insert(expenseTrackings)
      .values({
        itemName: input.itemName,
        projectId: input.projectId,
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
    const result = await db
      .update(expenseTrackings)
      .set({
        itemName: input.itemName,
        applicant: input.applicant,
        amount: input.amount,
        applicationDate: input.applicationDate,
        status: input.status,
        invoiceManagedFileId: input.invoiceManagedFileId,
        reimbursementDate: input.reimbursementDate,
        notes: input.notes,
        updatedAt: new Date()
      })
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
