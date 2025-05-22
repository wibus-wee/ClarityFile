import { useLocation } from 'react-router'
import { flatRoutes } from '@renderer/routes'

interface BreadcrumbItem {
  label: string
  path: string
  isLast: boolean
}

const useBreadcrumb = () => {
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean)

  const breadcrumbs: BreadcrumbItem[] = []
  let currentPath = ''

  // 遍历路径片段来构建面包屑
  for (let i = 0; i < paths.length; i++) {
    currentPath += `/${paths[i]}`

    // 查找当前路径对应的路由配置
    const parentRoute = flatRoutes.find((route) => {
      // 如果是父路由
      if (route.path === currentPath) {
        return true
      }
      // 如果是子路由
      if (route.children) {
        return route.children.some((child) => `${route.path}/${child.path}` === currentPath)
      }
      return false
    })

    if (parentRoute) {
      // 如果是子路由，找到对应的子路由配置
      if (parentRoute.children) {
        const childRoute = parentRoute.children.find(
          (child) => `${parentRoute.path}/${child.path}` === currentPath
        )
        if (childRoute) {
          breadcrumbs.push({
            label: childRoute.label,
            path: currentPath,
            isLast: i === paths.length - 1
          })
          continue
        }
      }

      // 如果是父路由或没找到对应的子路由
      breadcrumbs.push({
        label: parentRoute.label,
        path: currentPath,
        isLast: i === paths.length - 1
      })
    }
  }

  return breadcrumbs
}

export default useBreadcrumb
