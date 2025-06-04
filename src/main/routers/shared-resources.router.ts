import { SharedResourcesService } from '../services/shared-resources.service'
import { ITipc } from '../types'
import type {
  CreateSharedResourceInput,
  UpdateSharedResourceInput,
  DeleteSharedResourceInput,
  AssociateResourceToProjectInput,
  DisassociateResourceFromProjectInput,
  GetProjectSharedResourcesInput
} from '../types/inputs'

export function sharedResourcesRouter(t: ITipc) {
  return {
    // 获取项目关联的共享资源
    getProjectSharedResources: t.procedure
      .input<GetProjectSharedResourcesInput>()
      .action(async ({ input }) => {
        return await SharedResourcesService.getProjectSharedResources(input.projectId)
      }),

    // 获取所有共享资源
    getAllSharedResources: t.procedure.action(async () => {
      return await SharedResourcesService.getAllSharedResources()
    }),

    // 创建共享资源
    createSharedResource: t.procedure
      .input<CreateSharedResourceInput>()
      .action(async ({ input }) => {
        return await SharedResourcesService.createSharedResource(input)
      }),

    // 更新共享资源
    updateSharedResource: t.procedure
      .input<UpdateSharedResourceInput>()
      .action(async ({ input }) => {
        return await SharedResourcesService.updateSharedResource(input)
      }),

    // 删除共享资源
    deleteSharedResource: t.procedure
      .input<DeleteSharedResourceInput>()
      .action(async ({ input }) => {
        return await SharedResourcesService.deleteSharedResource(input.id)
      }),

    // 将共享资源关联到项目
    associateResourceToProject: t.procedure
      .input<AssociateResourceToProjectInput>()
      .action(async ({ input }) => {
        return await SharedResourcesService.associateResourceToProject(input)
      }),

    // 取消共享资源与项目的关联
    disassociateResourceFromProject: t.procedure
      .input<DisassociateResourceFromProjectInput>()
      .action(async ({ input }) => {
        return await SharedResourcesService.disassociateResourceFromProject(input)
      }),

    // 获取共享资源统计信息
    getSharedResourcesStatistics: t.procedure.action(async () => {
      return await SharedResourcesService.getSharedResourcesStatistics()
    }),

    // 根据类型获取共享资源
    getSharedResourcesByType: t.procedure.input<{ type: string }>().action(async ({ input }) => {
      return await SharedResourcesService.getSharedResourcesByType(input.type)
    })
  }
}
