import { CompetitionService } from '../services/competition.service'
import { ITipc } from '../types'
import type {
  CreateCompetitionSeriesInput,
  CreateCompetitionMilestoneInput,
  AddProjectToCompetitionInput,
  UpdateProjectCompetitionStatusInput,
  DeleteCompetitionSeriesInput,
  GetProjectCompetitionsInput,
  GetCompetitionMilestonesInput
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

    // 删除赛事系列
    deleteCompetitionSeries: t.procedure
      .input<DeleteCompetitionSeriesInput>()
      .action(async ({ input }) => {
        return await CompetitionService.deleteCompetitionSeries(input.id)
      }),

    // 获取赛事统计信息
    getCompetitionStatistics: t.procedure.action(async () => {
      return await CompetitionService.getCompetitionStatistics()
    })
  }
}
