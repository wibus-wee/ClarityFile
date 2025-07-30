import { useMemo } from 'react'
import type { Router } from '@tanstack/react-router'
import { createRouteCommands } from '../utils/route-commands'
import { useTranslatedRoutes } from '@renderer/routers'

/**
 * 路由命令管理 Hook
 *
 * 设计原则：
 * 1. 使用useMemo计算命令，而不是useEffect推送
 * 2. 直接返回计算结果，让组件决定如何使用
 * 3. 避免副作用，保持纯函数特性
 */
export function useRouteCommands(router: Router<any, any>) {
  const { flatRoutes } = useTranslatedRoutes()

  // ✅ 使用useMemo计算路由命令
  const routeCommands = useMemo(() => {
    if (!flatRoutes) return []
    return createRouteCommands(flatRoutes, router)
  }, [flatRoutes, router])

  return routeCommands
}
