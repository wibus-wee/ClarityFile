import { ProjectService } from '../services/project.service'
import type {
  CreateProjectInput,
  UpdateProjectInput,
  GetProjectInput,
  DeleteProjectInput,
  SearchProjectsInput,
  SyncProjectFolderPathInput,
  RepairProjectFolderInput
} from '../types/inputs'
import { ITipc } from '../types'

export function projectRouter(t: ITipc) {
  return {
    // 获取所有项目
    getProjects: t.procedure.action(async () => {
      return await ProjectService.getProjects()
    }),

    // 根据 ID 获取项目
    getProject: t.procedure.input<GetProjectInput>().action(async ({ input }) => {
      return await ProjectService.getProject(input)
    }),

    // 创建项目
    createProject: t.procedure.input<CreateProjectInput>().action(async ({ input }) => {
      return await ProjectService.createProject(input)
    }),

    // 更新项目
    updateProject: t.procedure.input<UpdateProjectInput>().action(async ({ input }) => {
      return await ProjectService.updateProject(input)
    }),

    // 删除项目
    deleteProject: t.procedure.input<DeleteProjectInput>().action(async ({ input }) => {
      return await ProjectService.deleteProject(input)
    }),

    // 搜索项目
    searchProjects: t.procedure.input<SearchProjectsInput>().action(async ({ input }) => {
      return await ProjectService.searchProjects(input)
    }),

    // 同步项目文件夹路径
    syncProjectFolderPath: t.procedure
      .input<SyncProjectFolderPathInput>()
      .action(async ({ input }) => {
        return await ProjectService.syncProjectFolderPath(input.projectId)
      }),

    // 批量同步所有项目的文件夹路径
    syncAllProjectFolderPaths: t.procedure.action(async () => {
      return await ProjectService.syncAllProjectFolderPaths()
    }),

    // 修复项目文件夹
    repairProjectFolder: t.procedure.input<RepairProjectFolderInput>().action(async ({ input }) => {
      return await ProjectService.repairProjectFolder(input.projectId)
    })
  }
}
