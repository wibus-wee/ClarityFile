import { useEffect } from 'react'
import type { Router } from '@tanstack/react-router'
import { createRouteCommands } from '../utils/route-commands'
import { useCommandPaletteStore } from '../stores/command-palette-store'
import { useTranslatedRoutes } from '@renderer/routers'

/**
 * 路由命令管理 Hook - 替换useRouteRegistry
 *
 * 功能：
 * - 使用纯函数和Zustand store管理路由命令
 * - 自动更新路由命令当翻译变化时
 * - 与React组件生命周期集成
 */
export function useRouteCommands(router: Router<any, any>) {
  const { flatRoutes } = useTranslatedRoutes()

  // 从store获取更新函数
  const updateRouteCommands = useCommandPaletteStore((state) => state.actions.updateRouteCommands)

  useEffect(() => {
    if (flatRoutes) {
      // 使用纯函数创建路由命令
      const routeCommands = createRouteCommands(flatRoutes, router)

      // 更新store中的路由命令
      updateRouteCommands(routeCommands)

      console.log('Route commands updated:', routeCommands.length)
    }
  }, [flatRoutes, router, updateRouteCommands])

  // 从store返回当前路由命令
  return useCommandPaletteStore((state) => state.routeCommands)
}
