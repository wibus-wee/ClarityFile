import { ExpenseTrackingService } from '../services/expense-tracking.service'
import { ITipc } from '../types'
import type {
  CreateExpenseTrackingInput,
  UpdateExpenseTrackingInput,
  DeleteExpenseTrackingInput,
  GetProjectExpensesInput
} from '../types/inputs'

export function expenseTrackingRouter(t: ITipc) {
  return {
    // 获取项目的所有经费记录
    getProjectExpenses: t.procedure.input<GetProjectExpensesInput>().action(async ({ input }) => {
      return await ExpenseTrackingService.getProjectExpenses(input.projectId)
    }),

    // 创建经费记录
    createExpenseTracking: t.procedure
      .input<CreateExpenseTrackingInput>()
      .action(async ({ input }) => {
        return await ExpenseTrackingService.createExpenseTracking(input)
      }),

    // 更新经费记录
    updateExpenseTracking: t.procedure
      .input<UpdateExpenseTrackingInput>()
      .action(async ({ input }) => {
        return await ExpenseTrackingService.updateExpenseTracking(input)
      }),

    // 删除经费记录
    deleteExpenseTracking: t.procedure
      .input<DeleteExpenseTrackingInput>()
      .action(async ({ input }) => {
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
