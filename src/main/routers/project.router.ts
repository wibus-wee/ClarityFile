import { ProjectService } from '../services/project.service'
import {
  createProjectSchema,
  updateProjectSchema,
  getProjectSchema,
  deleteProjectSchema,
  searchProjectsSchema,
  syncProjectFolderPathSchema,
  repairProjectFolderSchema
} from '../types/project-schemas'
import { ITipc } from '../types'

export function projectRouter(t: ITipc) {
  return {
    // 获取所有项目
    getProjects: t.procedure.action(async () => {
      return await ProjectService.getProjects()
    }),

    // 根据 ID 获取项目
    getProject: t.procedure.input(getProjectSchema).action(async ({ input }) => {
      return await ProjectService.getProject(input)
    }),

    // 获取项目详细信息（聚合所有相关数据）
    getProjectDetails: t.procedure.input(getProjectSchema).action(async ({ input }) => {
      return await ProjectService.getProjectDetails(input)
    }),

    // 创建项目
    createProject: t.procedure.input(createProjectSchema).action(async ({ input }) => {
      return await ProjectService.createProject(input)
    }),

    // 更新项目
    updateProject: t.procedure.input(updateProjectSchema).action(async ({ input }) => {
      return await ProjectService.updateProject(input)
    }),

    // 删除项目
    deleteProject: t.procedure.input(deleteProjectSchema).action(async ({ input }) => {
      return await ProjectService.deleteProject(input)
    }),

    // 搜索项目
    searchProjects: t.procedure.input(searchProjectsSchema).action(async ({ input }) => {
      return await ProjectService.searchProjects(input)
    }),

    // 同步项目文件夹路径
    syncProjectFolderPath: t.procedure
      .input(syncProjectFolderPathSchema)
      .action(async ({ input }) => {
        return await ProjectService.syncProjectFolderPath(input)
      }),

    // 批量同步所有项目的文件夹路径
    syncAllProjectFolderPaths: t.procedure.action(async () => {
      return await ProjectService.syncAllProjectFolderPaths()
    }),

    // 修复项目文件夹
    repairProjectFolder: t.procedure.input(repairProjectFolderSchema).action(async ({ input }) => {
      return await ProjectService.repairProjectFolder(input)
    })
  }
}
