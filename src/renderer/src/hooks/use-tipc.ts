import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'
import { tipcClient } from '../lib/tipc-client'

// 项目相关的 hooks
export function useProjects() {
  return useSWR('projects', () => tipcClient.getProjects())
}

export function useProject(id: string | null) {
  return useSWR(id ? ['project', id] : null, () => (id ? tipcClient.getProject({ id }) : null))
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
    async (
      key,
      { arg }: { arg: { id: string; name?: string; description?: string; status?: string } }
    ) => {
      const result = await tipcClient.updateProject(arg)
      // 重新验证项目列表和单个项目
      mutate('projects')
      mutate(['project', arg.id])
      return result
    }
  )
}

export function useDeleteProject() {
  return useSWRMutation('projects', async (key, { arg }: { arg: { id: string } }) => {
    const result = await tipcClient.deleteProject(arg)
    // 重新验证项目列表
    mutate('projects')
    return result
  })
}

export function useSearchProjects() {
  return useSWRMutation('search-projects', async (key, { arg }: { arg: { query: string } }) => {
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
    async (
      key,
      {
        arg
      }: {
        arg: {
          projectId: string
          name: string
          type: string
          description?: string
          defaultStoragePathSegment?: string
        }
      }
    ) => {
      const result = await tipcClient.createLogicalDocument(arg)
      // 重新验证所有文档列表和项目文档列表
      mutate('all-documents')
      mutate(['project-documents', arg.projectId])
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
  return useSWRMutation('tags', async (key, { arg }: { arg: { name: string; color?: string } }) => {
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
  return useSWR(key ? ['setting', key] : null, () => (key ? tipcClient.getSetting({ key }) : null))
}

export function useSetSetting() {
  return useSWRMutation(
    'settings',
    async (
      _mutationKey,
      {
        arg
      }: {
        arg: {
          key: string
          value: any
          category: string
          description?: string
          isUserModifiable?: boolean
        }
      }
    ) => {
      const result = await tipcClient.setSetting(arg)
      // 重新验证相关的设置数据
      mutate('settings')
      mutate(['setting', arg.key])
      mutate(['settings-by-category', arg.category])
      mutate('settings-categories')
      return result
    }
  )
}

export function useSetSettings() {
  return useSWRMutation(
    'settings',
    async (
      _mutationKey,
      {
        arg
      }: {
        arg: Array<{
          key: string
          value: any
          category: string
          description?: string
          isUserModifiable?: boolean
        }>
      }
    ) => {
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
    }
  )
}

export function useDeleteSetting() {
  return useSWRMutation('settings', async (_mutationKey, { arg }: { arg: { key: string } }) => {
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
  return useSWRMutation(
    'settings',
    async (_mutationKey, { arg }: { arg: { category?: string } }) => {
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
    }
  )
}

export function useSettingsCategories() {
  return useSWR('settings-categories', () => tipcClient.getSettingsCategories())
}

// 文件系统相关的 hooks
export function useSelectDirectory() {
  return useSWRMutation(
    'select-directory',
    async (_mutationKey, { arg }: { arg: { title?: string; defaultPath?: string } }) => {
      return await tipcClient.selectDirectory(arg)
    }
  )
}
