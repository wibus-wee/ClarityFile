import { CompetitionService } from '../services/competition.service'
import { ITipc } from '../types'
import type {
  CreateCompetitionSeriesInput,
  CreateCompetitionMilestoneInput,
  AddProjectToCompetitionInput,
  UpdateProjectCompetitionStatusInput,
  DeleteCompetitionSeriesInput,
  GetProjectCompetitionsInput,
  GetCompetitionMilestonesInput,
  RemoveProjectFromCompetitionInput,
  UpdateCompetitionSeriesInput,
  UpdateCompetitionMilestoneInput,
  DeleteCompetitionMilestoneInput,
  GetUpcomingMilestonesInput,
  GetMilestonesByDateRangeInput
} from '../types/inputs'

export function competitionRouter(t: ITipc) {
  return {
    // 获取项目参与的赛事里程碑
    getProjectCompetitions: t.procedure
      .input<GetProjectCompetitionsInput>()
      .action(async ({ input }) => {
        return await CompetitionService.getProjectCompetitions(input.projectId)
      }),

    // 获取所有赛事系列
    getAllCompetitionSeries: t.procedure.action(async () => {
      return await CompetitionService.getAllCompetitionSeries()
    }),

    // 获取赛事系列的所有里程碑
    getCompetitionMilestones: t.procedure
      .input<GetCompetitionMilestonesInput>()
      .action(async ({ input }) => {
        return await CompetitionService.getCompetitionMilestones(input.seriesId)
      }),

    // 创建赛事系列
    createCompetitionSeries: t.procedure
      .input<CreateCompetitionSeriesInput>()
      .action(async ({ input }) => {
        return await CompetitionService.createCompetitionSeries(input)
      }),

    // 创建赛事里程碑
    createCompetitionMilestone: t.procedure
      .input<CreateCompetitionMilestoneInput>()
      .action(async ({ input }) => {
        return await CompetitionService.createCompetitionMilestone(input)
      }),

    // 项目参与赛事里程碑
    addProjectToCompetition: t.procedure
      .input<AddProjectToCompetitionInput>()
      .action(async ({ input }) => {
        return await CompetitionService.addProjectToCompetition(input)
      }),

    // 更新项目在赛事中的状态
    updateProjectCompetitionStatus: t.procedure
      .input<UpdateProjectCompetitionStatusInput>()
      .action(async ({ input }) => {
        return await CompetitionService.updateProjectCompetitionStatus(input)
      }),

    // 移除项目与赛事的关联
    removeProjectFromCompetition: t.procedure
      .input<RemoveProjectFromCompetitionInput>()
      .action(async ({ input }) => {
        return await CompetitionService.removeProjectFromCompetition(input)
      }),

    // 删除赛事系列
    deleteCompetitionSeries: t.procedure
      .input<DeleteCompetitionSeriesInput>()
      .action(async ({ input }) => {
        return await CompetitionService.deleteCompetitionSeries(input.id)
      }),

    // 更新赛事系列
    updateCompetitionSeries: t.procedure
      .input<UpdateCompetitionSeriesInput>()
      .action(async ({ input }) => {
        return await CompetitionService.updateCompetitionSeries(input.id, input)
      }),

    // 更新赛事里程碑
    updateCompetitionMilestone: t.procedure
      .input<UpdateCompetitionMilestoneInput>()
      .action(async ({ input }) => {
        return await CompetitionService.updateCompetitionMilestone(input.id, input)
      }),

    // 删除赛事里程碑
    deleteCompetitionMilestone: t.procedure
      .input<DeleteCompetitionMilestoneInput>()
      .action(async ({ input }) => {
        return await CompetitionService.deleteCompetitionMilestone(input.id)
      }),

    // 获取赛事中心概览
    getCompetitionOverview: t.procedure.action(async () => {
      return await CompetitionService.getCompetitionOverview()
    }),

    // 获取即将到来的里程碑
    getUpcomingMilestones: t.procedure
      .input<GetUpcomingMilestonesInput>()
      .action(async ({ input }) => {
        return await CompetitionService.getUpcomingMilestones(input.limit)
      }),

    // 按日期范围获取里程碑
    getMilestonesByDateRange: t.procedure
      .input<GetMilestonesByDateRangeInput>()
      .action(async ({ input }) => {
        return await CompetitionService.getMilestonesByDateRange(input.startDate, input.endDate)
      }),

    // 获取赛事时间轴
    getCompetitionTimeline: t.procedure.action(async () => {
      return await CompetitionService.getCompetitionTimeline()
    }),

    // 获取赛事统计信息
    getCompetitionStatistics: t.procedure.action(async () => {
      return await CompetitionService.getCompetitionStatistics()
    })
  }
}
