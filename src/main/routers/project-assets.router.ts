import { ProjectAssetsService } from '../services/project-assets.service'
import { ITipc } from '../types'
import type {
  CreateProjectAssetInput,
  UpdateProjectAssetInput,
  DeleteProjectAssetInput,
  GetProjectAssetsInput,
  GetProjectCoverAssetInput
} from '../types/inputs'

export function projectAssetsRouter(t: ITipc) {
  return {
    // 获取项目的所有资产
    getProjectAssets: t.procedure.input<GetProjectAssetsInput>().action(async ({ input }) => {
      return await ProjectAssetsService.getProjectAssets(input.projectId)
    }),

    // 获取项目封面资产
    getProjectCoverAsset: t.procedure
      .input<GetProjectCoverAssetInput>()
      .action(async ({ input }) => {
        return await ProjectAssetsService.getProjectCoverAsset(input.coverAssetId)
      }),

    // 创建项目资产
    createProjectAsset: t.procedure.input<CreateProjectAssetInput>().action(async ({ input }) => {
      return await ProjectAssetsService.createProjectAsset(input)
    }),

    // 更新项目资产
    updateProjectAsset: t.procedure.input<UpdateProjectAssetInput>().action(async ({ input }) => {
      return await ProjectAssetsService.updateProjectAsset(input)
    }),

    // 删除项目资产
    deleteProjectAsset: t.procedure.input<DeleteProjectAssetInput>().action(async ({ input }) => {
      return await ProjectAssetsService.deleteProjectAsset(input.id)
    }),

    // 获取项目资产统计信息
    getProjectAssetsStatistics: t.procedure
      .input<{ projectId: string }>()
      .action(async ({ input }) => {
        return await ProjectAssetsService.getProjectAssetsStatistics(input.projectId)
      })
  }
}
