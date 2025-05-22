import { CreditCard, Files, Gauge, LucideIcon, SquareChartGantt } from 'lucide-react'

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
  Workspace: [
    {
      path: '/projects',
      label: 'Projects',
      icon: SquareChartGantt
    },
    {
      path: '/files',
      label: 'Files',
      icon: Files
    },
    {
      path: '/expenses',
      label: 'Expenses',
      icon: CreditCard
    }
  ],
  Entries: [
    {
      path: '/',
      label: 'Dashboard',
      icon: Gauge
    }
    // {
    //   path: "/settings",
    //   label: "Settings",
    //   icon: Settings2,
    //   children: [
    //     {
    //       path: "general",
    //       label: "General",
    //       element: Home,
    //     },
    //     {
    //       path: "team",
    //       label: "Team",
    //       element: Home,
    //     },
    //     {
    //       path: "billing",
    //       label: "Billing",
    //       element: Home,
    //     },
    //   ],
    // },
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
        url: `${route.path}/${child.path}`
      }))
    })
  }))
}))
