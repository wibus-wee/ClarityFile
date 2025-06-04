import { ExpenseTrackingService } from '../services/expense-tracking.service'
import { ITipc } from '../types'

export function expenseTrackingRouter(t: ITipc) {
  return {
    // 获取项目的所有经费记录
    getProjectExpenses: t.procedure.input<{ projectId: string }>().action(async ({ input }) => {
      return await ExpenseTrackingService.getProjectExpenses(input.projectId)
    }),

    // 创建经费记录
    createExpenseTracking: t.procedure
      .input<{
        itemName: string
        projectId: string
        applicant: string
        amount: number
        applicationDate: Date
        status: string
        invoiceManagedFileId?: string
        reimbursementDate?: Date
        notes?: string
      }>()
      .action(async ({ input }) => {
        return await ExpenseTrackingService.createExpenseTracking(input)
      }),

    // 更新经费记录
    updateExpenseTracking: t.procedure
      .input<{
        id: string
        itemName?: string
        applicant?: string
        amount?: number
        applicationDate?: Date
        status?: string
        invoiceManagedFileId?: string
        reimbursementDate?: Date
        notes?: string
      }>()
      .action(async ({ input }) => {
        return await ExpenseTrackingService.updateExpenseTracking(input)
      }),

    // 删除经费记录
    deleteExpenseTracking: t.procedure.input<{ id: string }>().action(async ({ input }) => {
      return await ExpenseTrackingService.deleteExpenseTracking(input.id)
    }),

    // 获取项目经费统计信息
    getProjectExpensesStatistics: t.procedure
      .input<{ projectId: string }>()
      .action(async ({ input }) => {
        return await ExpenseTrackingService.getProjectExpensesStatistics(input.projectId)
      }),

    // 获取所有经费记录
    getAllExpenses: t.procedure.action(async () => {
      return await ExpenseTrackingService.getAllExpenses()
    }),

    // 根据状态获取经费记录
    getExpensesByStatus: t.procedure.input<{ status: string }>().action(async ({ input }) => {
      return await ExpenseTrackingService.getExpensesByStatus(input.status)
    })
  }
}
