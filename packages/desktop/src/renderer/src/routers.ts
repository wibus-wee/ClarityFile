import {
  CreditCard,
  Files,
  Gauge,
  LucideIcon,
  SquareChartGantt,
  FileText,
  Trophy,
  Settings2
} from 'lucide-react'

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
    // {
    //   path: '/documents',
    //   label: '文档库',
    //   icon: FileText
    // },
    {
      path: '/competitions',
      label: '赛事中心',
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
      label: '经费报销',
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
