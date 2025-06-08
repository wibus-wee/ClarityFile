import { ProjectAssetsService } from '../services/project-assets.service'
import { ITipc } from '../types'
import type {
  CreateProjectAssetInput,
  UpdateProjectAssetInput,
  DeleteProjectAssetInput,
  GetProjectAssetsInput,
  GetProjectAssetInput,
  BatchDeleteProjectAssetsInput,
  SearchProjectAssetsInput
} from '../types/asset-schemas'

export function projectAssetsRouter(t: ITipc) {
  return {
    // 获取项目的所有资产
    getProjectAssets: t.procedure.input<GetProjectAssetsInput>().action(async ({ input }) => {
      return await ProjectAssetsService.getProjectAssets(input)
    }),

    // 获取项目封面资产
    getProjectCoverAsset: t.procedure
      .input<{ coverAssetId: string }>()
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
      return await ProjectAssetsService.deleteProjectAsset(input)
    }),

    // 获取项目资产统计信息
    getProjectAssetsStatistics: t.procedure
      .input<GetProjectAssetsInput>()
      .action(async ({ input }) => {
        return await ProjectAssetsService.getProjectAssetsStatistics(input)
      }),

    // 获取单个项目资产
    getProjectAsset: t.procedure.input<GetProjectAssetInput>().action(async ({ input }) => {
      return await ProjectAssetsService.getProjectAsset(input)
    }),

    // 批量删除项目资产
    batchDeleteProjectAssets: t.procedure
      .input<BatchDeleteProjectAssetsInput>()
      .action(async ({ input }) => {
        return await ProjectAssetsService.batchDeleteProjectAssets(input)
      }),

    // 搜索项目资产
    searchProjectAssets: t.procedure.input<SearchProjectAssetsInput>().action(async ({ input }) => {
      return await ProjectAssetsService.searchProjectAssets(input)
    })
  }
}
