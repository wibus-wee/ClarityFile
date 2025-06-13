import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'
import { tipcClient } from '../lib/tipc-client'
import type {
  CreateLogicalDocumentInput,
  UpdateLogicalDocumentInput,
  DeleteLogicalDocumentInput,
  CreateDocumentVersionInput,
  UpdateDocumentVersionInput,
  DeleteDocumentVersionInput
} from '../../../main/types/document-schemas'
import type {
  CreateProjectAssetInput,
  UpdateProjectAssetInput,
  DeleteProjectAssetInput
} from '../../../main/types/asset-schemas'
import type {
  CreateTagInput,
  CreateSharedResourceInput,
  UpdateSharedResourceInput,
  DeleteSharedResourceInput,
  AssociateResourceToProjectInput,
  DisassociateResourceFromProjectInput,
  SetSettingInput,
  SetSettingsInput,
  DeleteSettingInput,
  ResetSettingsInput,
  SelectDirectoryInput,
  SelectFileInput
} from '../../../main/types/inputs'
import type {
  CreateExpenseTrackingInput,
  UpdateExpenseTrackingInput,
  DeleteExpenseTrackingInput
} from '../../../main/types/expense-schemas'
import type {
  CreateProjectInput,
  UpdateProjectInput,
  DeleteProjectInput,
  SearchProjectsInput
} from '../../../main/types/project-schemas'
import type {
  CreateCompetitionSeriesInput,
  CreateCompetitionMilestoneInput,
  AddProjectToCompetitionInput,
  UpdateProjectCompetitionStatusInput,
  RemoveProjectFromCompetitionInput,
  DeleteCompetitionSeriesInput,
  UpdateCompetitionSeriesInput,
  UpdateCompetitionMilestoneInput,
  DeleteCompetitionMilestoneInput
} from '../../../main/types/competition-schemas'
import type {
  CreateManagedFileInput,
  GetGlobalFilesInput
} from '../../../main/services/managed-file.service'
import type { FileImportContext } from '../../../main/services/intelligent/intelligent-file-import.service'

// 项目相关的 hooks
export function useProjects() {
  return useSWR('projects', () => tipcClient.getProjects())
}

export function useProject(id: string | null) {
  return useSWR(id ? ['project', id] : null, () => (id ? tipcClient.getProject({ id }) : null))
}

export function useProjectDetails(id: string | null) {
  return useSWR(id ? ['project-details', id] : null, () =>
    id ? tipcClient.getProjectDetails({ id }) : null
  )
}

export function useCreateProject() {
  return useSWRMutation('projects', async (_key, { arg }: { arg: CreateProjectInput }) => {
    const result = await tipcClient.createProject(arg)
    // 重新验证项目列表
    mutate('projects')
    return result
  })
}

export function useUpdateProject() {
  return useSWRMutation('projects', async (_key, { arg }: { arg: UpdateProjectInput }) => {
    const result = await tipcClient.updateProject(arg)
    // 重新验证项目列表和单个项目
    mutate('projects')
    mutate(['project', arg.id])
    return result
  })
}

export function useDeleteProject() {
  return useSWRMutation('projects', async (_key, { arg }: { arg: DeleteProjectInput }) => {
    const result = await tipcClient.deleteProject(arg)
    // 重新验证项目列表
    mutate('projects')
    return result
  })
}

export function useSearchProjects() {
  return useSWRMutation('search-projects', async (_key, { arg }: { arg: SearchProjectsInput }) => {
    return tipcClient.searchProjects(arg)
  })
}

// 逻辑文档相关的 hooks
export function useAllDocuments() {
  return useSWR('all-documents', () => tipcClient.getAllDocuments())
}

export function useProjectDocuments(projectId: string | null) {
  return useSWR(projectId ? ['project-documents', projectId] : null, () =>
    projectId ? tipcClient.getProjectDocuments({ projectId }) : null
  )
}

export function useCreateLogicalDocument() {
  return useSWRMutation(
    'logical-documents',
    async (_key, { arg }: { arg: CreateLogicalDocumentInput }) => {
      const result = await tipcClient.createLogicalDocument(arg)
      // 重新验证所有文档列表和项目文档列表
      mutate('all-documents')
      mutate(['project-documents', arg.projectId])
      // 重新验证项目详情（包含文档统计信息）
      mutate(['project-details', arg.projectId])
      return result
    }
  )
}

export function useLogicalDocument(documentId: string | null) {
  return useSWR(documentId ? ['logical-document', documentId] : null, () =>
    documentId ? tipcClient.getLogicalDocument({ id: documentId }) : null
  )
}

export function useLogicalDocumentWithVersions(documentId: string | null) {
  return useSWR(documentId ? ['logical-document-with-versions', documentId] : null, () =>
    documentId ? tipcClient.getLogicalDocumentWithVersions({ id: documentId }) : null
  )
}

export function useDocumentTypes() {
  return useSWR('document-types', () => tipcClient.getDocumentTypes())
}

// 标签相关的 hooks
export function useTags() {
  return useSWR('tags', () => tipcClient.getTags())
}

export function useCreateTag() {
  return useSWRMutation('tags', async (_key, { arg }: { arg: CreateTagInput }) => {
    const result = await tipcClient.createTag(arg)
    // 重新验证标签列表
    mutate('tags')
    return result
  })
}

// 管理文件相关的 hooks
export function useManagedFiles(limit?: number, offset?: number) {
  return useSWR(['managed-files', limit, offset], () =>
    tipcClient.getManagedFiles({ limit, offset })
  )
}

export function useCreateManagedFile() {
  return useSWRMutation('managed-files', async (_key, { arg }: { arg: CreateManagedFileInput }) => {
    const result = await tipcClient.createManagedFile(arg)
    // 重新验证文件列表
    mutate((key) => Array.isArray(key) && key[0] === 'managed-files')
    return result
  })
}

// 系统信息相关的 hooks
export function useSystemInfo() {
  return useSWR('system-info', () => tipcClient.getSystemInfo(), {
    refreshInterval: 30000 // 每30秒刷新一次
  })
}

// 设置相关的 hooks
export function useSettings() {
  return useSWR('settings', () => tipcClient.getSettings())
}

export function useSettingsByCategory(category: string | null) {
  return useSWR(category ? ['settings-by-category', category] : null, () =>
    category ? tipcClient.getSettingsByCategory({ category }) : null
  )
}

export function useSetting(key: string | null) {
  return useSWR(key ? ['setting', key] : null, async () => {
    if (!key) return null
    const setting = await tipcClient.getSetting({ key })
    if (setting && setting.value) {
      // 解析 JSON 存储的值
      try {
        const parsedValue =
          typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value
        return { ...setting, value: parsedValue }
      } catch (error) {
        console.warn(`解析设置值失败 (${key}):`, error)
        return setting
      }
    }
    return setting
  })
}

export function useSetSetting() {
  return useSWRMutation('settings', async (_mutationKey, { arg }: { arg: SetSettingInput }) => {
    const result = await tipcClient.setSetting(arg)
    // 重新验证相关的设置数据
    mutate('settings')
    mutate(['setting', arg.key])
    mutate(['settings-by-category', arg.category])
    mutate('settings-categories')
    return result
  })
}

export function useSetSettings() {
  return useSWRMutation('settings', async (_mutationKey, { arg }: { arg: SetSettingsInput }) => {
    const result = await tipcClient.setSettings(arg)
    // 重新验证所有设置相关数据
    mutate('settings')
    mutate('settings-categories')
    // 重新验证涉及的分类
    const categories = [...new Set(arg.map((setting) => setting.category))]
    categories.forEach((category) => {
      mutate(['settings-by-category', category])
    })
    // 重新验证涉及的单个设置
    arg.forEach((setting) => {
      mutate(['setting', setting.key])
    })
    return result
  })
}

export function useDeleteSetting() {
  return useSWRMutation('settings', async (_mutationKey, { arg }: { arg: DeleteSettingInput }) => {
    const result = await tipcClient.deleteSetting(arg)
    // 重新验证设置数据
    mutate('settings')
    mutate(['setting', arg.key])
    // 注意：我们不知道被删除设置的分类，所以重新验证所有分类数据
    mutate((key) => Array.isArray(key) && key[0] === 'settings-by-category')
    return result
  })
}

export function useResetSettings() {
  return useSWRMutation('settings', async (_mutationKey, { arg }: { arg: ResetSettingsInput }) => {
    const result = await tipcClient.resetSettings(arg)
    // 重新验证所有设置相关数据
    mutate('settings')
    mutate('settings-categories')
    if (arg.category) {
      // 如果指定了分类，只重新验证该分类
      mutate(['settings-by-category', arg.category])
    } else {
      // 如果没有指定分类，重新验证所有分类
      mutate((key) => Array.isArray(key) && key[0] === 'settings-by-category')
    }
    // 重新验证所有单个设置
    mutate((key) => Array.isArray(key) && key[0] === 'setting')
    return result
  })
}

export function useSettingsCategories() {
  return useSWR('settings-categories', () => tipcClient.getSettingsCategories())
}

// 文件导入相关的 hooks
export function useImportFile() {
  return useSWRMutation(
    'import-file',
    async (_mutationKey, { arg }: { arg: FileImportContext }) => {
      const result = await tipcClient.importFile(arg)
      // 重新验证文件列表
      mutate((key) => Array.isArray(key) && key[0] === 'managed-files')
      return result
    }
  )
}

// 文档版本相关的 hooks
export function useCreateDocumentVersion() {
  return useSWRMutation(
    'document-versions',
    async (_mutationKey, { arg }: { arg: CreateDocumentVersionInput }) => {
      const result = await tipcClient.createDocumentVersion(arg)
      // 重新验证相关数据
      mutate(['logical-document-with-versions', arg.logicalDocumentId])
      mutate('all-documents')
      // 重新验证受管文件列表（因为创建了新的文件记录）
      mutate((key) => Array.isArray(key) && key[0] === 'managed-files')
      // 重新验证项目详情（更新统计信息）
      mutate((key) => Array.isArray(key) && key[0] === 'project-details')
      return result
    }
  )
}

export function useUpdateDocumentVersion() {
  return useSWRMutation(
    'document-versions',
    async (_mutationKey, { arg }: { arg: UpdateDocumentVersionInput }) => {
      const result = await tipcClient.updateDocumentVersion(arg)
      // 重新验证相关数据
      mutate('all-documents')
      // 重新验证项目详情（更新统计信息）
      mutate((key) => Array.isArray(key) && key[0] === 'project-details')
      return result
    }
  )
}

export function useDeleteDocumentVersion() {
  return useSWRMutation(
    'document-versions',
    async (_mutationKey, { arg }: { arg: DeleteDocumentVersionInput }) => {
      const result = await tipcClient.deleteDocumentVersion(arg)
      // 重新验证相关数据
      mutate('all-documents')
      // 重新验证项目详情（更新统计信息）
      mutate((key) => Array.isArray(key) && key[0] === 'project-details')
      return result
    }
  )
}

// 智能文件导入相关的 hooks
export function useIntelligentFileImport() {
  return useSWRMutation(
    'intelligent-file-import',
    async (_mutationKey, { arg }: { arg: FileImportContext }) => {
      const result = await tipcClient.importFile(arg)
      // 重新验证相关数据
      mutate('all-documents')
      if (arg.logicalDocumentId) {
        mutate(['logical-document-with-versions', arg.logicalDocumentId])
      }
      if (arg.projectId) {
        mutate(['project-documents', arg.projectId])
        mutate(['project-details', arg.projectId])
      }
      mutate((key) => Array.isArray(key) && key[0] === 'managed-files')
      return result
    }
  )
}

export function usePreviewFileImport() {
  return useSWRMutation(
    'preview-file-import',
    async (_mutationKey, { arg }: { arg: FileImportContext }) => {
      return await tipcClient.previewImport(arg)
    }
  )
}

// 文档上传相关的 hooks (基于智能文件导入)
export function useUploadDocumentVersion() {
  return useSWRMutation(
    'upload-document-version',
    async (_mutationKey, { arg }: { arg: FileImportContext }) => {
      const result = await tipcClient.uploadDocumentVersion(arg)

      // 重新验证相关数据 - 更精确的缓存更新
      mutate('all-documents')
      if (arg.logicalDocumentId) {
        mutate(['logical-document-with-versions', arg.logicalDocumentId])
      }
      if (arg.projectId) {
        mutate(['project-documents', arg.projectId])
        // 只重新验证特定项目的详情，而不是所有项目详情
        mutate(['project-details', arg.projectId])
      }
      mutate((key) => Array.isArray(key) && key[0] === 'managed-files')

      return result
    }
  )
}

export function usePreviewDocumentUpload() {
  return useSWRMutation(
    'preview-document-upload',
    async (_mutationKey, { arg }: { arg: FileImportContext }) => {
      return await tipcClient.previewDocumentUpload(arg)
    }
  )
}

export function useCheckFileUploadAbility() {
  return useSWRMutation(
    'check-file-upload-ability',
    async (_mutationKey, { arg }: { arg: { filePath: string } }) => {
      return await tipcClient.checkFileUploadAbility(arg)
    }
  )
}

export function useGenerateVersionTag() {
  return useSWRMutation(
    'generate-version-tag',
    async (_mutationKey, { arg }: { arg: { prefix?: string } }) => {
      return await tipcClient.generateVersionTag(arg)
    }
  )
}

// 文件系统相关的 hooks
export function useSelectDirectory() {
  return useSWRMutation(
    'select-directory',
    async (_mutationKey, { arg }: { arg: SelectDirectoryInput }) => {
      return await tipcClient.selectDirectory(arg)
    }
  )
}

export function useSelectFile() {
  return useSWRMutation('select-file', async (_mutationKey, { arg }: { arg: SelectFileInput }) => {
    return await tipcClient.selectFile(arg)
  })
}

// 逻辑文档更新和删除相关的 hooks
export function useUpdateLogicalDocument() {
  return useSWRMutation(
    'logical-documents',
    async (_key, { arg }: { arg: UpdateLogicalDocumentInput }) => {
      const result = await tipcClient.updateLogicalDocument(arg)
      // 重新验证相关数据
      mutate('all-documents')
      mutate(['logical-document', arg.id])
      mutate(['logical-document-with-versions', arg.id])
      mutate((key) => Array.isArray(key) && key[0] === 'project-details')
      return result
    }
  )
}

export function useDeleteLogicalDocument() {
  return useSWRMutation(
    'logical-documents',
    async (_key, { arg }: { arg: DeleteLogicalDocumentInput }) => {
      const result = await tipcClient.deleteLogicalDocument(arg)
      // 重新验证相关数据
      mutate('all-documents')
      mutate((key) => Array.isArray(key) && key[0] === 'project-details')
      return result
    }
  )
}

// 项目资产相关的 hooks
export function useCreateProjectAsset() {
  return useSWRMutation(
    'project-assets',
    async (_key, { arg }: { arg: CreateProjectAssetInput }) => {
      const result = await tipcClient.createProjectAsset(arg)
      // 重新验证项目详情
      mutate(['project-details', arg.projectId])
      return result
    }
  )
}

export function useUpdateProjectAsset() {
  return useSWRMutation(
    'project-assets',
    async (_key, { arg }: { arg: UpdateProjectAssetInput }) => {
      const result = await tipcClient.updateProjectAsset(arg)
      // 重新验证相关数据
      mutate((key) => Array.isArray(key) && key[0] === 'project-details')
      return result
    }
  )
}

export function useDeleteProjectAsset() {
  return useSWRMutation(
    'project-assets',
    async (_key, { arg }: { arg: DeleteProjectAssetInput }) => {
      const result = await tipcClient.deleteProjectAsset(arg)
      // 重新验证相关数据
      mutate((key) => Array.isArray(key) && key[0] === 'project-details')
      return result
    }
  )
}

// 经费追踪相关的 hooks
export function useCreateExpenseTracking() {
  return useSWRMutation(
    'expense-tracking',
    async (_key, { arg }: { arg: CreateExpenseTrackingInput }) => {
      const result = await tipcClient.createExpenseTracking(arg)
      // 重新验证项目详情
      mutate(['project-details', arg.projectId])
      return result
    }
  )
}

export function useUpdateExpenseTracking() {
  return useSWRMutation(
    'expense-tracking',
    async (_key, { arg }: { arg: UpdateExpenseTrackingInput }) => {
      const result = await tipcClient.updateExpenseTracking(arg)
      // 重新验证相关数据
      mutate((key) => Array.isArray(key) && key[0] === 'project-details')
      return result
    }
  )
}

export function useDeleteExpenseTracking() {
  return useSWRMutation(
    'expense-tracking',
    async (_key, { arg }: { arg: DeleteExpenseTrackingInput }) => {
      const result = await tipcClient.deleteExpenseTracking(arg)
      // 重新验证相关数据
      mutate((key) => Array.isArray(key) && key[0] === 'project-details')
      return result
    }
  )
}

// 经费池相关的 hooks
export function useProjectBudgetPools(projectId: string | null) {
  return useSWR(projectId ? ['project-budget-pools', projectId] : null, () =>
    projectId ? tipcClient.getProjectBudgetPools({ projectId }) : null
  )
}

export function useProjectBudgetOverview(projectId: string | null) {
  return useSWR(projectId ? ['project-budget-overview', projectId] : null, () =>
    projectId ? tipcClient.getProjectBudgetOverview({ projectId }) : null
  )
}

export function useCreateBudgetPool() {
  return useSWRMutation('budget-pools', async (_key, { arg }: { arg: any }) => {
    const result = await tipcClient.createBudgetPool(arg)
    // 重新验证项目详情和经费池列表
    mutate(['project-details', arg.projectId])
    mutate(['project-budget-pools', arg.projectId])
    mutate(['project-budget-overview', arg.projectId])
    return result
  })
}

export function useUpdateBudgetPool() {
  return useSWRMutation('budget-pools', async (_key, { arg }: { arg: any }) => {
    const result = await tipcClient.updateBudgetPool(arg)
    // 重新验证相关数据
    mutate((key) => Array.isArray(key) && key[0] === 'project-details')
    mutate((key) => Array.isArray(key) && key[0] === 'project-budget-pools')
    mutate((key) => Array.isArray(key) && key[0] === 'project-budget-overview')
    return result
  })
}

export function useDeleteBudgetPool() {
  return useSWRMutation('budget-pools', async (_key, { arg }: { arg: any }) => {
    const result = await tipcClient.deleteBudgetPool(arg)
    // 重新验证相关数据
    mutate((key) => Array.isArray(key) && key[0] === 'project-details')
    mutate((key) => Array.isArray(key) && key[0] === 'project-budget-pools')
    mutate((key) => Array.isArray(key) && key[0] === 'project-budget-overview')
    return result
  })
}

// 共享资源相关的 hooks
export function useCreateSharedResource() {
  return useSWRMutation(
    'shared-resources',
    async (_key, { arg }: { arg: CreateSharedResourceInput }) => {
      const result = await tipcClient.createSharedResource(arg)
      // 重新验证所有共享资源
      mutate('all-shared-resources')
      return result
    }
  )
}

export function useUpdateSharedResource() {
  return useSWRMutation(
    'shared-resources',
    async (_key, { arg }: { arg: UpdateSharedResourceInput }) => {
      const result = await tipcClient.updateSharedResource(arg)
      // 重新验证相关数据
      mutate('all-shared-resources')
      mutate((key) => Array.isArray(key) && key[0] === 'project-details')
      return result
    }
  )
}

export function useDeleteSharedResource() {
  return useSWRMutation(
    'shared-resources',
    async (_key, { arg }: { arg: DeleteSharedResourceInput }) => {
      const result = await tipcClient.deleteSharedResource(arg)
      // 重新验证相关数据
      mutate('all-shared-resources')
      mutate((key) => Array.isArray(key) && key[0] === 'project-details')
      return result
    }
  )
}

export function useAssociateResourceToProject() {
  return useSWRMutation(
    'shared-resources',
    async (_key, { arg }: { arg: AssociateResourceToProjectInput }) => {
      const result = await tipcClient.associateResourceToProject(arg)
      // 重新验证项目详情
      mutate(['project-details', arg.projectId])
      return result
    }
  )
}

export function useDisassociateResourceFromProject() {
  return useSWRMutation(
    'shared-resources',
    async (_key, { arg }: { arg: DisassociateResourceFromProjectInput }) => {
      const result = await tipcClient.disassociateResourceFromProject(arg)
      // 重新验证项目详情
      mutate(['project-details', arg.projectId])
      return result
    }
  )
}

// 赛事管理相关的 hooks
export function useGetAllCompetitionSeries() {
  return useSWR('all-competition-series', () => tipcClient.getAllCompetitionSeries())
}

export function useGetCompetitionMilestones(seriesId: string, options?: { enabled?: boolean }) {
  return useSWR(
    seriesId && options?.enabled !== false ? ['competition-milestones', seriesId] : null,
    () => (seriesId ? tipcClient.getCompetitionMilestones({ seriesId }) : null)
  )
}

export function useCreateCompetitionSeries() {
  return useSWRMutation(
    'competition-series',
    async (_key, { arg }: { arg: CreateCompetitionSeriesInput }) => {
      const result = await tipcClient.createCompetitionSeries(arg)
      // 重新验证所有赛事系列
      mutate('all-competition-series')
      return result
    }
  )
}

export function useCreateCompetitionMilestone() {
  return useSWRMutation(
    'competition-milestones',
    async (_key, { arg }: { arg: CreateCompetitionMilestoneInput }) => {
      const result = await tipcClient.createCompetitionMilestone(arg)
      // 重新验证赛事里程碑
      mutate(['competition-milestones', arg.competitionSeriesId])
      return result
    }
  )
}

export function useAddProjectToCompetition() {
  return useSWRMutation(
    'project-competitions',
    async (_key, { arg }: { arg: AddProjectToCompetitionInput }) => {
      const result = await tipcClient.addProjectToCompetition(arg)
      // 重新验证项目详情
      mutate(['project-details', arg.projectId])
      return result
    }
  )
}

export function useUpdateProjectCompetitionStatus() {
  return useSWRMutation(
    'project-competitions',
    async (_key, { arg }: { arg: UpdateProjectCompetitionStatusInput }) => {
      const result = await tipcClient.updateProjectCompetitionStatus(arg)
      // 重新验证项目详情
      mutate(['project-details', arg.projectId])
      return result
    }
  )
}

export function useRemoveProjectFromCompetition() {
  return useSWRMutation(
    'project-competitions',
    async (_key, { arg }: { arg: RemoveProjectFromCompetitionInput }) => {
      const result = await tipcClient.removeProjectFromCompetition(arg)
      // 重新验证项目详情
      mutate(['project-details', arg.projectId])
      return result
    }
  )
}

export function useDeleteCompetitionSeries() {
  return useSWRMutation(
    'competition-series',
    async (_key, { arg }: { arg: DeleteCompetitionSeriesInput }) => {
      const result = await tipcClient.deleteCompetitionSeries(arg)
      // 重新验证所有赛事系列
      mutate('all-competition-series')
      mutate((key) => Array.isArray(key) && key[0] === 'project-details')
      return result
    }
  )
}

// 赛事中心专用的 hooks
export function useCompetitionOverview() {
  return useSWR('competition-overview', () => tipcClient.getCompetitionOverview())
}

export function useUpcomingMilestones(limit?: number) {
  return useSWR(['upcoming-milestones', limit], () =>
    tipcClient.getUpcomingMilestones({ limit: limit || 10 })
  )
}

export function useMilestonesByDateRange(
  startDate: Date,
  endDate: Date,
  options?: { enabled?: boolean }
) {
  return useSWR(
    options?.enabled !== false
      ? ['milestones-by-date-range', startDate.toISOString(), endDate.toISOString()]
      : null,
    () => tipcClient.getMilestonesByDateRange({ startDate, endDate })
  )
}

export function useCompetitionTimeline() {
  return useSWR('competition-timeline', () => tipcClient.getCompetitionTimeline())
}

export function useUpdateCompetitionSeries() {
  return useSWRMutation(
    'competition-series',
    async (_key, { arg }: { arg: UpdateCompetitionSeriesInput }) => {
      const result = await tipcClient.updateCompetitionSeries(arg)
      // 重新验证所有赛事系列和概览
      mutate('all-competition-series')
      mutate('competition-overview')
      return result
    }
  )
}

export function useUpdateCompetitionMilestone() {
  return useSWRMutation(
    'competition-milestones',
    async (_key, { arg }: { arg: UpdateCompetitionMilestoneInput }) => {
      const result = await tipcClient.updateCompetitionMilestone(arg)
      // 重新验证相关数据
      mutate((key) => Array.isArray(key) && key[0] === 'competition-milestones')
      mutate('competition-overview')
      mutate((key) => Array.isArray(key) && key[0] === 'upcoming-milestones')
      mutate('competition-timeline')
      return result
    }
  )
}

export function useDeleteCompetitionMilestone() {
  return useSWRMutation(
    'competition-milestones',
    async (_key, { arg }: { arg: DeleteCompetitionMilestoneInput }) => {
      const result = await tipcClient.deleteCompetitionMilestone(arg)
      // 重新验证相关数据
      mutate((key) => Array.isArray(key) && key[0] === 'competition-milestones')
      mutate('competition-overview')
      mutate((key) => Array.isArray(key) && key[0] === 'upcoming-milestones')
      mutate('competition-timeline')
      mutate((key) => Array.isArray(key) && key[0] === 'project-details')
      return result
    }
  )
}

// 文件访问相关的 hooks
export function useGenerateFileDataUrl() {
  return useSWRMutation(['file-data-url'], (_, { arg }: { arg: { filePath: string } }) =>
    tipcClient.generateFileDataUrl(arg)
  )
}

export function useGetFileData() {
  return useSWRMutation(['file-data'], (_, { arg }: { arg: { filePath: string } }) =>
    tipcClient.getFileData(arg)
  )
}

export function useIsImageFile() {
  return useSWRMutation(['is-image-file'], (_, { arg }: { arg: { filePath: string } }) =>
    tipcClient.isImageFile(arg)
  )
}

export function useCompetitionStatistics() {
  return useSWR('competition-statistics', () => tipcClient.getCompetitionStatistics())
}

export function useMilestoneParticipatingProjects(milestoneId: string | null) {
  return useSWR(milestoneId ? ['milestone-participating-projects', milestoneId] : null, () =>
    milestoneId ? tipcClient.getMilestoneParticipatingProjects({ milestoneId }) : null
  )
}

// 文件管理相关的 hooks
export function useGlobalFiles(filters?: GetGlobalFilesInput) {
  return useSWR(['global-files', filters], () => tipcClient.getGlobalFiles(filters || {}))
}

export function useFileSystemStats() {
  return useSWR('file-system-stats', () => tipcClient.getFileSystemStats())
}

// 文件系统操作相关的 hooks
export function useRenameFile() {
  return useSWRMutation(
    'rename-file',
    async (_key, { arg }: { arg: { fileId: string; newName: string } }) => {
      const result = await tipcClient.renameFile(arg)
      // 重新验证文件列表
      mutate((key) => Array.isArray(key) && key[0] === 'global-files')
      mutate((key) => Array.isArray(key) && key[0] === 'managed-files')
      return result
    }
  )
}

export function useCopyFileToDirectory() {
  return useSWRMutation(
    'copy-file-to-directory',
    async (_key, { arg }: { arg: { fileId: string; targetDirectory?: string } }) => {
      return await tipcClient.copyFileToDirectory(arg)
    }
  )
}

export function useOpenFileWithSystem() {
  return useSWRMutation(
    'open-file-with-system',
    async (_key, { arg }: { arg: { filePath: string } }) => {
      return await tipcClient.openFileWithSystem(arg)
    }
  )
}

export function useOpenFileByIdWithSystem() {
  return useSWRMutation(
    'open-file-by-id-with-system',
    async (_key, { arg }: { arg: { fileId: string } }) => {
      return await tipcClient.openFileByIdWithSystem(arg)
    }
  )
}

export function useMoveFileToTrash() {
  return useSWRMutation(
    'move-file-to-trash',
    async (_key, { arg }: { arg: { fileId: string } }) => {
      const result = await tipcClient.moveFileToTrash(arg)
      // 重新验证文件列表
      mutate((key) => Array.isArray(key) && key[0] === 'global-files')
      mutate((key) => Array.isArray(key) && key[0] === 'managed-files')
      mutate('file-system-stats')
      return result
    }
  )
}

export function useSaveFileAs() {
  return useSWRMutation(
    'save-file-as',
    async (_key, { arg }: { arg: { fileId: string; targetPath?: string } }) => {
      return await tipcClient.saveFileAs(arg)
    }
  )
}

export function useBatchMoveFilesToTrash() {
  return useSWRMutation(
    'batch-move-files-to-trash',
    async (_key, { arg }: { arg: { fileIds: string[] } }) => {
      const result = await tipcClient.batchMoveFilesToTrash(arg)
      // 重新验证文件列表
      mutate((key) => Array.isArray(key) && key[0] === 'global-files')
      mutate((key) => Array.isArray(key) && key[0] === 'managed-files')
      mutate('file-system-stats')
      return result
    }
  )
}

export function useBatchCopyFilesToDirectory() {
  return useSWRMutation(
    'batch-copy-files-to-directory',
    async (_key, { arg }: { arg: { fileIds: string[]; targetDirectory: string } }) => {
      return await tipcClient.batchCopyFilesToDirectory(arg)
    }
  )
}

// QuickLook 预览相关的 hooks
export function useQuickLookPreviewById() {
  return useSWRMutation(
    'quicklook-preview-by-id',
    async (_key, { arg }: { arg: { fileId: string } }) => {
      return await tipcClient.previewFileById(arg)
    }
  )
}

export function useQuickLookPreviewByPath() {
  return useSWRMutation(
    'quicklook-preview-by-path',
    async (_key, { arg }: { arg: { filePath: string } }) => {
      return await tipcClient.previewFileByPath(arg)
    }
  )
}

export function useIsQuickLookAvailable() {
  return useSWR('quicklook-available', () => tipcClient.isQuickLookAvailable())
}

export function useQuickLookSupportedFileTypes() {
  return useSWR('quicklook-supported-types', () => tipcClient.getSupportedFileTypes())
}

export function useIsFileSupported() {
  return useSWRMutation(
    'quicklook-file-supported',
    async (_key, { arg }: { arg: { fileName: string } }) => {
      return await tipcClient.isFileSupported(arg)
    }
  )
}

export function useDeleteManagedFile() {
  return useSWRMutation(
    'delete-managed-file',
    async (_key, { arg }: { arg: { id: string; deletePhysicalFile?: boolean } }) => {
      const result = await tipcClient.deleteManagedFile(arg)
      // 重新验证文件列表
      mutate((key) => Array.isArray(key) && key[0] === 'global-files')
      mutate((key) => Array.isArray(key) && key[0] === 'managed-files')
      mutate('file-system-stats')
      return result
    }
  )
}
