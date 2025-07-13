import {
  CreditCard,
  Files,
  Gauge,
  LucideIcon,
  SquareChartGantt,
  Trophy,
  Settings2
} from 'lucide-react'
import { useTranslation } from '@renderer/i18n/hooks'

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
        label: t('files:title'),
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

// 保持向后兼容的静态路由（用于不需要翻译的场景）
export const routes: AppRoute = {
  Features: [
    {
      path: '/',
      label: '仪表板',
      icon: Gauge
    },
    {
      path: '/files',
      label: '文件管理',
      icon: Files
    }
  ],
  Workspace: [
    {
      path: '/projects',
      label: '项目',
      icon: SquareChartGantt
    },
    {
      path: '/competitions',
      label: '赛事中心',
      icon: Trophy
    },
    {
      path: '/expenses',
      label: '经费报销',
      icon: CreditCard
    }
  ],
  Others: [
    {
      path: '/settings',
      label: '设置',
      icon: Settings2,
      children: [
        {
          path: '?category=general',
          label: '常规设置'
        },
        {
          path: '?category=appearance',
          label: '外观设置'
        },
        {
          path: '?category=notifications',
          label: '通知设置'
        },
        {
          path: '?category=language',
          label: '语言与地区'
        },
        {
          path: '?category=accessibility',
          label: '无障碍'
        },
        {
          path: '?category=audio-video',
          label: '音频与视频'
        },
        {
          path: '?category=privacy',
          label: '隐私与可见性'
        },
        {
          path: '?category=advanced',
          label: '高级设置'
        }
      ]
    }
  ]
}

// Hook for creating translated routes
export function useTranslatedRoutes() {
  const { t } = useTranslation()

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

// 保持向后兼容的静态导出
export const flatRoutes = Object.values(routes).flat()
export const transformedRoutes = Object.entries(routes).map(([group, routes]) => ({
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
