import { BudgetPoolService } from '../services/budget-pool.service'
import { ITipc } from '../types'
import type {
  CreateBudgetPoolInput,
  UpdateBudgetPoolInput,
  DeleteBudgetPoolInput,
  GetProjectBudgetPoolsInput,
  GetBudgetPoolInput
} from '../types/budget-pool-schemas'

export function budgetPoolRouter(t: ITipc) {
  return {
    // 获取项目的所有经费池
    getProjectBudgetPools: t.procedure
      .input<GetProjectBudgetPoolsInput>()
      .action(async ({ input }) => {
        return await BudgetPoolService.getProjectBudgetPools(input)
      }),

    // 获取经费池详情
    getBudgetPool: t.procedure.input<GetBudgetPoolInput>().action(async ({ input }) => {
      return await BudgetPoolService.getBudgetPool(input)
    }),

    // 创建经费池
    createBudgetPool: t.procedure.input<CreateBudgetPoolInput>().action(async ({ input }) => {
      return await BudgetPoolService.createBudgetPool(input)
    }),

    // 更新经费池
    updateBudgetPool: t.procedure.input<UpdateBudgetPoolInput>().action(async ({ input }) => {
      return await BudgetPoolService.updateBudgetPool(input)
    }),

    // 删除经费池
    deleteBudgetPool: t.procedure.input<DeleteBudgetPoolInput>().action(async ({ input }) => {
      return await BudgetPoolService.deleteBudgetPool(input)
    }),

    // 获取经费池统计信息
    getBudgetPoolStatistics: t.procedure.input<{ id: string }>().action(async ({ input }) => {
      return await BudgetPoolService.getBudgetPoolStatistics(input.id)
    }),

    // 获取项目经费概览
    getProjectBudgetOverview: t.procedure
      .input<{ projectId: string }>()
      .action(async ({ input }) => {
        return await BudgetPoolService.getProjectBudgetOverview(input.projectId)
      }),

    // 获取所有经费池（跨项目）
    getAllBudgetPools: t.procedure.action(async () => {
      return await BudgetPoolService.getAllBudgetPools()
    }),

    // 获取全局经费概览
    getGlobalBudgetOverview: t.procedure.action(async () => {
      return await BudgetPoolService.getGlobalBudgetOverview()
    })
  }
}
