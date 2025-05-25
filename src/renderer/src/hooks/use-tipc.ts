import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'
import { tipcClient } from '../lib/tipc-client'

// 项目相关的 hooks
export function useProjects() {
  return useSWR('projects', () => tipcClient.getProjects())
}

export function useProject(id: string | null) {
  return useSWR(
    id ? ['project', id] : null,
    () => id ? tipcClient.getProject({ id }) : null
  )
}

export function useCreateProject() {
  return useSWRMutation(
    'projects',
    async (key, { arg }: { arg: { name: string; description?: string; status?: string } }) => {
      const result = await tipcClient.createProject(arg)
      // 重新验证项目列表
      mutate('projects')
      return result
    }
  )
}

export function useUpdateProject() {
  return useSWRMutation(
    'projects',
    async (key, { arg }: { arg: { id: string; name?: string; description?: string; status?: string } }) => {
      const result = await tipcClient.updateProject(arg)
      // 重新验证项目列表和单个项目
      mutate('projects')
      mutate(['project', arg.id])
      return result
    }
  )
}

export function useDeleteProject() {
  return useSWRMutation(
    'projects',
    async (key, { arg }: { arg: { id: string } }) => {
      const result = await tipcClient.deleteProject(arg)
      // 重新验证项目列表
      mutate('projects')
      return result
    }
  )
}

export function useSearchProjects() {
  return useSWRMutation(
    'search-projects',
    async (key, { arg }: { arg: { query: string } }) => {
      return tipcClient.searchProjects(arg)
    }
  )
}

// 逻辑文档相关的 hooks
export function useProjectDocuments(projectId: string | null) {
  return useSWR(
    projectId ? ['project-documents', projectId] : null,
    () => projectId ? tipcClient.getProjectDocuments({ projectId }) : null
  )
}

export function useCreateLogicalDocument() {
  return useSWRMutation(
    'logical-documents',
    async (key, { arg }: { 
      arg: {
        projectId: string
        name: string
        type: string
        description?: string
        defaultStoragePathSegment?: string
      }
    }) => {
      const result = await tipcClient.createLogicalDocument(arg)
      // 重新验证项目文档列表
      mutate(['project-documents', arg.projectId])
      return result
    }
  )
}

// 标签相关的 hooks
export function useTags() {
  return useSWR('tags', () => tipcClient.getTags())
}

export function useCreateTag() {
  return useSWRMutation(
    'tags',
    async (key, { arg }: { arg: { name: string; color?: string } }) => {
      const result = await tipcClient.createTag(arg)
      // 重新验证标签列表
      mutate('tags')
      return result
    }
  )
}

// 管理文件相关的 hooks
export function useManagedFiles(limit?: number, offset?: number) {
  return useSWR(
    ['managed-files', limit, offset],
    () => tipcClient.getManagedFiles({ limit, offset })
  )
}

export function useCreateManagedFile() {
  return useSWRMutation(
    'managed-files',
    async (key, { arg }: { arg: { name: string; physicalPath: string; fileHash?: string } }) => {
      const result = await tipcClient.createManagedFile(arg)
      // 重新验证文件列表
      mutate((key) => Array.isArray(key) && key[0] === 'managed-files')
      return result
    }
  )
}

// 系统信息相关的 hooks
export function useSystemInfo() {
  return useSWR('system-info', () => tipcClient.getSystemInfo(), {
    refreshInterval: 30000 // 每30秒刷新一次
  })
}
