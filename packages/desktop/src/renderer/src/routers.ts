import {
  CreditCard,
  Files,
  Gauge,
  LucideIcon,
  SquareChartGantt,
  Trophy,
  Settings2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface AppRoute {
  [key: string]: AppRouteItem[]
}

export interface AppRouteItem {
  path: string
  label: string
  icon: LucideIcon
  isActive?: boolean
  children?: Pick<AppRouteItem, 'path' | 'label' | 'isActive'>[]
}

// 创建动态路由配置函数
export function createRoutes(t: (key: string, options?: any) => string): AppRoute {
  return {
    Features: [
      {
        path: '/',
        label: t('navigation:dashboard'),
        icon: Gauge
      },
      {
        path: '/files',
        label: t('navigation:files'),
        icon: Files
      }
    ],
    Workspace: [
      {
        path: '/projects',
        label: t('navigation:projects'),
        icon: SquareChartGantt
      },
      // {
      //   path: '/documents',
      //   label: '文档库',
      //   icon: FileText
      // },
      {
        path: '/competitions',
        label: t('navigation:competitions'),
        icon: Trophy
      },
      // {
      //   path: '/shared-resources',
      //   label: '共享资源',
      //   icon: Share2
      // },
      // {
      //   path: '/project-assets',
      //   label: '项目资产',
      //   icon: Image
      // },
      {
        path: '/expenses',
        label: t('navigation:expenses'),
        icon: CreditCard
      }
      // {
      //   path: '/tags',
      //   label: '标签管理',
      //   icon: Tags
      // }
    ],
    Others: [
      {
        path: '/settings',
        label: t('navigation:settings'),
        icon: Settings2,
        children: [
          {
            path: '?category=general',
            label: t('settings:categories.general')
          },
          {
            path: '?category=appearance',
            label: t('settings:categories.appearance')
          },
          {
            path: '?category=notifications',
            label: t('settings:categories.notifications')
          },
          {
            path: '?category=language',
            label: t('settings:categories.language')
          },
          {
            path: '?category=accessibility',
            label: t('settings:categories.accessibility')
          },
          {
            path: '?category=audio-video',
            label: t('settings:categories.audioVideo')
          },
          {
            path: '?category=privacy',
            label: t('settings:categories.privacy')
          },
          {
            path: '?category=advanced',
            label: t('settings:categories.advanced')
          }
        ]
      }
    ]
  }
}

// Hook for creating translated routes
export function useTranslatedRoutes() {
  const { t } = useTranslation(['navigation', 'settings'])

  const translatedRoutes = createRoutes(t as any)

  const flatRoutes = Object.values(translatedRoutes).flat()
  const transformedRoutes = Object.entries(translatedRoutes).map(([group, routes]) => ({
    group,
    items: routes.map((route) => ({
      title: route.label,
      url: route.path,
      icon: route.icon,
      isActive: route.isActive,
      ...(route.children && {
        items: route.children.map((child) => ({
          title: child.label,
          url: `${child.path}`
        }))
      })
    }))
  }))

  return { flatRoutes, transformedRoutes }
}
