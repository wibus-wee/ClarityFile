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
  DollarSign,
  Palette,
  Sun,
  Moon,
  Monitor,
  Brush,
  Check
} from 'lucide-react'
import { useCommandBox } from './stores/command-box-store'
import { useSuggestions } from './hooks/use-suggestions'
import { useGlobalDrawersStore } from '@renderer/stores/global-drawers'
import { ShortcutProvider, Shortcut } from '@renderer/components/shortcuts'
import { useTheme } from '@renderer/hooks/use-theme'
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
  // const { openImportAssistant } = useImportAssistantStore() // 暂时未使用

  // 主题管理
  const {
    theme,
    currentTheme,
    setTheme,
    customThemes,
    activeCustomTheme,
    applyCustomTheme,
    switchToDefaultTheme,
    hasCustomTheme
  } = useTheme()

  // 智能建议
  useSuggestions() // 自动运行智能建议生成

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
        category: '创建',
        keywords: ['新建', '项目', '创建', 'new', 'project'],
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
        category: '文件',
        keywords: ['导入', '文件', '上传', 'import', 'upload', 'file'],
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
        category: '创建',
        keywords: ['新建', '文档', '创建', 'new', 'document'],
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
        category: '经费',
        keywords: ['添加', '报销', '经费', 'expense', 'add'],
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

    // 添加外观设置相关的操作项目
    const appearanceItems: ActionItem[] = [
      // 基础主题切换
      {
        id: 'action-theme-light',
        type: 'action',
        title: '浅色主题',
        description: '切换到浅色主题',
        icon: Sun,
        category: '外观设置',
        keywords: ['浅色', '明亮', '主题', 'light', 'theme', '外观'],
        action: async () => {
          close()
          await setTheme('light')
        }
      },
      {
        id: 'action-theme-dark',
        type: 'action',
        title: '深色主题',
        description: '切换到深色主题',
        icon: Moon,
        category: '外观设置',
        keywords: ['深色', '暗色', '主题', 'dark', 'theme', '外观'],
        action: async () => {
          close()
          await setTheme('dark')
        }
      },
      {
        id: 'action-theme-system',
        type: 'action',
        title: '跟随系统',
        description: '主题跟随系统设置',
        icon: Monitor,
        category: '外观设置',
        keywords: ['系统', '自动', '主题', 'system', 'auto', 'theme', '外观'],
        action: async () => {
          close()
          await setTheme('system')
        }
      }
    ]

    // 添加自定义主题切换项目
    const customThemeItems: ActionItem[] = customThemes.map((customTheme) => ({
      id: `action-custom-theme-${customTheme.id}`,
      type: 'action' as const,
      title: `${customTheme.name}${activeCustomTheme === customTheme.id ? ' ✓' : ''}`,
      description: customTheme.description || '自定义主题',
      icon: activeCustomTheme === customTheme.id ? Check : Brush,
      category: '外观设置',
      keywords: ['自定义', '主题', customTheme.name, 'custom', 'theme', '外观'],
      action: async () => {
        close()
        if (activeCustomTheme === customTheme.id) {
          // 如果当前已经是这个主题，则切换回默认主题
          await switchToDefaultTheme()
        } else {
          // 否则切换到这个自定义主题
          await applyCustomTheme(customTheme.id)
        }
      }
    }))

    // 添加主题管理相关操作
    const themeManagementItems: ActionItem[] = [
      {
        id: 'action-current-theme-status',
        type: 'action',
        title: `当前主题: ${hasCustomTheme ? customThemes.find((t) => t.id === activeCustomTheme)?.name || '未知' : theme === 'system' ? `跟随系统 (${currentTheme})` : currentTheme === 'light' ? '浅色' : '深色'}`,
        description: '显示当前激活的主题信息',
        icon: Palette,
        category: '外观设置',
        keywords: ['当前', '主题', '状态', 'current', 'theme', 'status', '外观'],
        action: () => {
          // 这个命令主要用于显示状态，不执行实际操作
          close()
        }
      },
      {
        id: 'action-theme-settings',
        type: 'action',
        title: '主题管理',
        description: '打开主题管理页面',
        icon: Settings,
        category: '外观设置',
        keywords: ['主题', '管理', '设置', 'theme', 'settings', 'management', '外观'],
        action: () => {
          close()
          router.navigate({ to: '/settings' })
        }
      }
    ]

    // 合并所有操作项目
    const allActionItems = [
      ...actionItems,
      ...appearanceItems,
      ...customThemeItems,
      ...themeManagementItems
    ]

    setActionItems(allActionItems)
  }, [
    setActionItems,
    close,
    router,
    openDocumentForm,
    openExpenseForm,
    theme,
    currentTheme,
    setTheme,
    customThemes,
    activeCustomTheme,
    applyCustomTheme,
    switchToDefaultTheme,
    hasCustomTheme
  ])

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

  return (
    <ShortcutProvider scope="global">
      {/* 全局 Command Box 快捷键 */}
      <Shortcut shortcut={['cmd', 'k']} scope="global" description="打开命令面板" priority={100}>
        <div style={{ display: 'none' }} onClick={toggle} />
      </Shortcut>

      {children}
    </ShortcutProvider>
  )
}
