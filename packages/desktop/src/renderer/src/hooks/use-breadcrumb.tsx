import { useLocation } from '@tanstack/react-router'
import { useTranslatedRoutes } from '@renderer/routers'
import { useProjectDetails } from '@renderer/hooks/use-tipc'

interface BreadcrumbItem {
  label: string
  path: string
  isLast: boolean
}

export const useBreadcrumb = () => {
  const location = useLocation()
  const { flatRoutes } = useTranslatedRoutes()
  const paths = location.pathname.split('/').filter(Boolean)

  // 提取可能的动态路由参数
  const projectId = paths[0] === 'projects' && paths[1] ? paths[1] : null

  // 获取项目数据（只在需要时使用）
  const { data: projectDetails, isLoading: isProjectLoading } = useProjectDetails(projectId)

  const breadcrumbs: BreadcrumbItem[] = []
  let currentPath = ''

  // 遍历路径片段来构建面包屑
  for (let i = 0; i < paths.length; i++) {
    currentPath += `/${paths[i]}`

    // 检查是否是项目详情页
    const isProjectDetailPage = currentPath.startsWith('/projects/') && paths.length >= 2 && i === 1

    if (isProjectDetailPage) {
      // 对于项目详情页，使用项目名称
      let projectLabel = '项目详情'

      if (isProjectLoading) {
        projectLabel = '加载中...'
      } else if (projectDetails?.project?.name) {
        projectLabel = projectDetails.project.name
      }

      breadcrumbs.push({
        label: projectLabel,
        path: currentPath,
        isLast: i === paths.length - 1
      })
      continue
    }

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
