import { ReactNode, useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import {
  Home,
  FolderOpen,
  Files,
  Trophy,
  CreditCard,
  Settings,
  Plus,
  Upload,
  FileText,
  DollarSign
} from 'lucide-react'
import { useCommandBox } from './stores/command-box-store'
import { useGlobalKeyboard } from './hooks/use-keyboard'
import { useSuggestions } from './hooks/use-suggestions'
import { useGlobalDrawersStore } from '@renderer/stores/global-drawers'
import { useImportAssistantStore } from '@renderer/stores/import-assistant'
import type { NavigationItem, ActionItem } from './types/command-box.types'

interface CommandBoxProviderProps {
  children: ReactNode
}

/**
 * Command Box Provider
 * 初始化 Command Box 的数据和全局快捷键
 */
export function CommandBoxProvider({ children }: CommandBoxProviderProps) {
  const router = useRouter()
  const { toggle, setNavigationItems, setActionItems, close, addRecentItem } = useCommandBox()

  // 全局状态管理
  const { openExpenseForm, openDocumentForm } = useGlobalDrawersStore()
  const { openImportAssistant } = useImportAssistantStore()

  // 智能建议
  const { isGenerating } = useSuggestions()

  // 全局快捷键
  useGlobalKeyboard(toggle)

  // 初始化导航项目
  useEffect(() => {
    const navigationItems: NavigationItem[] = [
      {
        id: 'nav-dashboard',
        type: 'navigation',
        title: '仪表板',
        description: '查看项目概览和统计信息',
        icon: Home,
        shortcut: '⌘1',
        path: '/',
        action: () => router.navigate({ to: '/' })
      },
      {
        id: 'nav-projects',
        type: 'navigation',
        title: '项目列表',
        description: '管理和查看所有项目',
        icon: FolderOpen,
        shortcut: '⌘2',
        path: '/projects',
        action: () => router.navigate({ to: '/projects' })
      },
      {
        id: 'nav-files',
        type: 'navigation',
        title: '文件管理',
        description: '浏览和管理项目文件',
        icon: Files,
        shortcut: '⌘3',
        path: '/files',
        action: () => router.navigate({ to: '/files' })
      },
      {
        id: 'nav-competitions',
        type: 'navigation',
        title: '赛事中心',
        description: '管理竞赛和比赛信息',
        icon: Trophy,
        shortcut: '⌘4',
        path: '/competitions',
        action: () => router.navigate({ to: '/competitions' })
      },
      {
        id: 'nav-expenses',
        type: 'navigation',
        title: '经费报销',
        description: '管理项目经费和报销记录',
        icon: CreditCard,
        shortcut: '⌘5',
        path: '/expenses',
        action: () => router.navigate({ to: '/expenses' })
      },
      {
        id: 'nav-settings',
        type: 'navigation',
        title: '设置',
        description: '应用设置和偏好配置',
        icon: Settings,
        shortcut: '⌘,',
        path: '/settings',
        action: () => router.navigate({ to: '/settings' })
      }
    ]

    setNavigationItems(navigationItems)
  }, [router, setNavigationItems])

  // 初始化操作项目
  useEffect(() => {
    const actionItems: ActionItem[] = [
      {
        id: 'action-new-project',
        type: 'action',
        title: '新建项目',
        description: '创建一个新的项目',
        icon: Plus,
        shortcut: '⌘N',
        action: () => {
          close()
          router.navigate({ to: '/projects' })
          // TODO: 触发新建项目的 drawer 或 dialog
          // 这里可能需要添加项目创建的全局状态管理
        }
      },
      {
        id: 'action-import-files',
        type: 'action',
        title: '导入文件',
        description: '导入文件到当前项目',
        icon: Upload,
        shortcut: '⌘I',
        action: () => {
          close()
          // 打开导入助手，但需要模拟文件拖拽
          // 这里可以导航到文件管理页面或者触发文件选择对话框
          router.navigate({ to: '/files' })
        }
      },
      {
        id: 'action-new-document',
        type: 'action',
        title: '新建文档',
        description: '创建一个新的文档',
        icon: FileText,
        action: () => {
          close()
          // 打开新建文档的 drawer
          openDocumentForm({
            mode: 'create',
            prefilledData: {
              name: '',
              type: 'document',
              description: ''
            }
          })
        }
      },
      {
        id: 'action-add-expense',
        type: 'action',
        title: '添加报销',
        description: '添加新的报销记录',
        icon: DollarSign,
        action: () => {
          close()
          // 打开新建报销的 drawer
          openExpenseForm({
            mode: 'create',
            prefilledData: {
              itemName: '',
              applicant: '',
              amount: 0,
              notes: ''
            }
          })
        }
      }
    ]

    setActionItems(actionItems)
  }, [setActionItems, close, router, openDocumentForm, openExpenseForm])

  // 监听路由变化，记录最近访问
  useEffect(() => {
    const currentPath = router.state.location.pathname

    // 根据当前路径添加到最近访问
    const createRecentItem = (path: string) => {
      switch (true) {
        case path === '/':
          return {
            id: 'recent-dashboard',
            type: 'document' as const, // 使用 SearchResultType
            title: '仪表板',
            description: '查看项目概览和统计信息',
            path: '/',
            timestamp: Date.now(),
            frequency: 1,
            metadata: { type: 'navigation' }
          }

        case path === '/projects':
          return {
            id: 'recent-projects',
            type: 'project' as const,
            title: '项目列表',
            description: '管理和查看所有项目',
            path: '/projects',
            timestamp: Date.now(),
            frequency: 1,
            metadata: { type: 'navigation' }
          }

        case path.startsWith('/projects/'): {
          const projectId = path.split('/')[2]
          return {
            id: `recent-project-${projectId}`,
            type: 'project' as const,
            title: `项目详情`,
            description: `项目 ID: ${projectId}`,
            path: path,
            timestamp: Date.now(),
            frequency: 1,
            metadata: { type: 'project', projectId }
          }
        }

        case path === '/files':
          return {
            id: 'recent-files',
            type: 'file' as const,
            title: '文件管理',
            description: '浏览和管理项目文件',
            path: '/files',
            timestamp: Date.now(),
            frequency: 1,
            metadata: { type: 'navigation' }
          }

        case path === '/competitions':
          return {
            id: 'recent-competitions',
            type: 'competition' as const,
            title: '赛事中心',
            description: '管理竞赛和比赛信息',
            path: '/competitions',
            timestamp: Date.now(),
            frequency: 1,
            metadata: { type: 'navigation' }
          }

        case path === '/expenses':
          return {
            id: 'recent-expenses',
            type: 'expense' as const,
            title: '经费报销',
            description: '管理项目经费和报销记录',
            path: '/expenses',
            timestamp: Date.now(),
            frequency: 1,
            metadata: { type: 'navigation' }
          }

        case path === '/settings':
          return {
            id: 'recent-settings',
            type: 'document' as const, // 设置页面归类为文档类型
            title: '设置',
            description: '应用设置和偏好配置',
            path: '/settings',
            timestamp: Date.now(),
            frequency: 1,
            metadata: { type: 'navigation' }
          }

        default:
          return null
      }
    }

    const recentItem = createRecentItem(currentPath)
    if (recentItem) {
      addRecentItem(recentItem)
    }
  }, [router.state.location.pathname, addRecentItem])

  return <>{children}</>
}
