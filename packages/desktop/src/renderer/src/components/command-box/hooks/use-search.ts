import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useRouter } from '@tanstack/react-router'
import { SearchEngine } from '../utils/search-engine'
import { useCommandBox } from '../stores/command-box-store'
import { useProjects, useGlobalFiles, useAllDocuments } from '@renderer/hooks/use-tipc'
import type { SearchableItem, SearchResult, SearchOptions } from '../types/command-box.types'

/**
 * 搜索功能 Hook
 * 集成各种数据源，提供统一的搜索接口
 */
export function useSearch(query: string, options?: SearchOptions) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const { usageStats, recentItems, navigationItems, actionItems } = useCommandBox()

  // 数据源 hooks
  const { data: projects } = useProjects()
  const { data: files } = useGlobalFiles()
  const { data: documents } = useAllDocuments()

  // 搜索引擎实例
  const searchEngine = useMemo(() => {
    const engine = new SearchEngine({
      threshold: 0.4,
      maxResults: 20
    })

    // 更新统计数据
    if (usageStats && recentItems) {
      const recentItemsWithTimestamp = recentItems.map((item) => ({
        id: item.id,
        timestamp: item.timestamp
      }))
      engine.updateStats(usageStats, recentItemsWithTimestamp)
    }

    return engine
  }, [usageStats, recentItems])

  // 构建搜索数据源
  const searchableItems = useMemo((): SearchableItem[] => {
    const items: SearchableItem[] = []

    // 导航项数据
    navigationItems.forEach((navItem) => {
      items.push({
        id: navItem.id,
        type: 'navigation' as any, // 扩展类型以支持导航项
        title: navItem.title,
        description: navItem.description || '',
        tags: [navItem.title, navItem.description || ''].filter(Boolean),
        path: navItem.path,
        metadata: {
          type: 'navigation',
          shortcut: navItem.shortcut,
          path: navItem.path
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    })

    // 操作项数据
    actionItems.forEach((actionItem) => {
      items.push({
        id: actionItem.id,
        type: 'action' as any, // 扩展类型以支持操作项
        title: actionItem.title,
        description: actionItem.description || '',
        tags: [actionItem.title, actionItem.description || ''].filter(Boolean),
        metadata: {
          type: 'action',
          shortcut: actionItem.shortcut
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    })

    // 项目数据
    if (projects) {
      projects.forEach((project) => {
        items.push({
          id: `project-${project.id}`,
          type: 'project',
          title: project.name,
          description: project.description || '',
          tags: [],
          path: `/projects/${project.id}`,
          metadata: {
            status: project.status,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            folderPath: project.folderPath
          },
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString()
        })
      })
    }

    // 文档数据
    if (documents) {
      documents.forEach((document) => {
        items.push({
          id: `document-${document.id}`,
          type: 'document',
          title: document.name,
          description: document.description || '',
          content: document.type, // 将文档类型作为可搜索内容
          tags: [document.name, document.type, document.description].filter((tag): tag is string =>
            Boolean(tag)
          ),
          metadata: {
            documentType: document.type,
            status: document.status,
            projectId: document.projectId,
            currentOfficialVersionId: document.currentOfficialVersionId,
            defaultStoragePathSegment: document.defaultStoragePathSegment,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt
          },
          createdAt: document.createdAt.toISOString(),
          updatedAt: document.updatedAt.toISOString()
        })
      })
    }

    // 文件数据
    if (files) {
      files.files.forEach((file) => {
        items.push({
          id: `file-${file.id}`,
          type: 'file',
          title: file.originalFileName,
          description: file.name, // 只使用文件名作为描述，不包含 mimeType
          tags: [file.name].filter(Boolean), // 移除 mimeType，只保留文件名
          path: file.physicalPath,
          metadata: {
            fileType: file.mimeType,
            fileSize: file.fileSizeBytes,
            fileName: file.name,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt
          },
          createdAt: file.createdAt.toISOString(),
          updatedAt: file.updatedAt.toISOString()
        })
      })
    }
    return items
  }, [navigationItems, actionItems, projects, documents, files])

  // 防抖搜索函数
  const debouncedSearch = useDebouncedCallback(
    useCallback(
      (searchQuery: string) => {
        if (!searchQuery.trim()) {
          setSearchResults([])
          setIsSearching(false)
          return
        }

        setIsSearching(true)

        try {
          const results = searchEngine.search(searchQuery, searchableItems, options)
          setSearchResults(results)
        } catch (error) {
          console.error('搜索失败:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      },
      [searchEngine, searchableItems, options]
    ),
    300 // 300ms 防抖
  )

  // 执行搜索
  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  // 高亮搜索结果
  const highlightText = useCallback(
    (text: string, matches?: Array<{ indices: [number, number][] }>) => {
      return searchEngine.highlightMatches(text, matches)
    },
    [searchEngine]
  )

  // 记录搜索使用
  const recordUsage = useCallback(
    (itemId: string) => {
      searchEngine.updateUsageStats(itemId)
      searchEngine.updateRecentAccess(itemId)
    },
    [searchEngine]
  )

  // 转换搜索结果为 CommandItem 格式
  const getSearchCommandItems = useCallback(
    (executeSearchAction: (result: SearchResult) => void) => {
      return searchResults.map((result) => ({
        id: result.id,
        type: 'search-result' as const,
        title: result.title,
        description: result.description,
        icon: undefined,
        action: () => executeSearchAction(result),
        metadata: result
      }))
    },
    [searchResults]
  )

  return {
    searchResults,
    isSearching,
    highlightText,
    recordUsage,
    totalResults: searchResults.length,
    getSearchCommandItems
  }
}

/**
 * 搜索建议 Hook
 * 基于用户行为提供智能搜索建议
 */
export function useSearchSuggestions() {
  const { searchHistory, recentItems } = useCommandBox()

  const suggestions = useMemo(() => {
    const items: string[] = []

    // 最近搜索历史
    items.push(...searchHistory.slice(0, 3))

    // 最近访问的项目名称
    const recentProjectNames = recentItems
      .filter((item) => item.type === 'project')
      .slice(0, 3)
      .map((item) => item.title)

    items.push(...recentProjectNames)

    // 去重并限制数量
    return Array.from(new Set(items)).slice(0, 5)
  }, [searchHistory, recentItems])

  return suggestions
}

/**
 * 搜索快捷操作 Hook
 * 提供基于搜索结果的快捷操作
 */
export function useSearchActions() {
  const router = useRouter()
  const { addRecentItem, updateUsageStats, navigationItems, actionItems } = useCommandBox()

  const executeSearchAction = useCallback(
    (result: SearchResult) => {
      // 记录使用统计
      updateUsageStats(result.id)

      // 添加到最近访问
      addRecentItem({
        id: result.id,
        type: result.type,
        title: result.title,
        description: result.description,
        path: result.path || '',
        timestamp: Date.now(),
        frequency: 1,
        metadata: result.metadata
      })

      // 根据类型执行相应操作
      switch (result.type) {
        case 'navigation': {
          // 执行导航操作
          if (result.path) {
            router.navigate({ to: result.path })
          }
          break
        }

        case 'action': {
          // 执行操作项的 action
          const actionItem = actionItems.find((item) => item.id === result.id)
          if (actionItem) {
            actionItem.action()
          }
          break
        }

        case 'project': {
          // 跳转到项目详情
          const projectId = result.id.replace('project-', '')
          router.navigate({ to: `/projects/${projectId}` })
          break
        }

        case 'document': {
          // 跳转到项目详情页面的文档Tab
          const projectId = result.metadata?.projectId
          if (projectId) {
            router.navigate({
              to: `/projects/${projectId}`,
              hash: `document-${result.id.replace('document-', '')}`
            })
          } else {
            // 如果没有项目ID，跳转到项目列表页面
            router.navigate({ to: '/projects' })
          }
          break
        }

        case 'file': {
          // 跳转到文件管理页面
          router.navigate({
            to: '/files',
            search: { search: result.title }
          })
          break
        }

        case 'expense': {
          // 跳转到报销页面
          router.navigate({ to: '/expenses' })
          break
        }

        default:
          console.log('未知操作类型:', result.type)
      }
    },
    [router, addRecentItem, updateUsageStats, navigationItems, actionItems]
  )

  return {
    executeSearchAction
  }
}
