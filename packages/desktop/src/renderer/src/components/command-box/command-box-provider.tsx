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
  const { toggle, setNavigationItems, setActionItems } = useCommandBox()

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
          // 这里需要触发新建项目的操作
          // 可以通过全局状态管理或者事件系统来实现
          console.log('创建新项目')
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
          // 触发文件导入操作
          console.log('导入文件')
        }
      },
      {
        id: 'action-new-document',
        type: 'action',
        title: '新建文档',
        description: '创建一个新的文档',
        icon: FileText,
        action: () => {
          console.log('新建文档')
        }
      },
      {
        id: 'action-add-expense',
        type: 'action',
        title: '添加报销',
        description: '添加新的报销记录',
        icon: DollarSign,
        action: () => {
          console.log('添加报销')
        }
      }
    ]

    setActionItems(actionItems)
  }, [setActionItems])

  // 监听路由变化，记录最近访问
  useEffect(() => {
    // 根据当前路径添加到最近访问
    // 这里可以根据具体的路由信息来创建 RecentItem
    // 暂时先不实现，等后续完善
  }, [router.state.location.pathname])

  return <>{children}</>
}
