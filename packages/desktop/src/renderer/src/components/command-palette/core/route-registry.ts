import { useRef, useEffect } from 'react'
import { type Router } from '@tanstack/react-router'
import Fuse, { type IFuseOptions } from 'fuse.js'
import { pinyin } from 'pinyin-pro'
import { useTranslatedRoutes, type AppRouteItem } from '@renderer/routers'
import type { RouteCommand } from '../types'

/**
 * 路由注册表类
 *
 * 功能：
 * - 管理应用路由作为命令
 * - 支持中文、英文、拼音搜索
 * - 集成现有的翻译系统
 * - 提供模糊搜索功能
 */
export class RouteRegistry {
  private routes: RouteCommand[] = []
  private fuse: Fuse<RouteCommand> | null = null

  constructor(private router: Router<any, any>) {}

  /**
   * 更新路由列表
   */
  updateRoutes(translatedRoutes: AppRouteItem[]) {
    this.routes = this.convertRoutesToCommands(translatedRoutes)
    this.initializeFuse()
  }

  /**
   * 搜索路由命令
   */
  search(query: string): RouteCommand[] {
    if (!query.trim()) {
      return this.routes
    }

    if (!this.fuse) {
      return []
    }

    const results = this.fuse.search(query)
    return results.map((result) => result.item)
  }

  /**
   * 获取所有路由命令
   */
  getAllRoutes(): RouteCommand[] {
    return this.routes
  }

  /**
   * 将路由转换为命令
   */
  private convertRoutesToCommands(routes: AppRouteItem[]): RouteCommand[] {
    return routes.map((route) => ({
      id: `route:${route.path}`,
      title: route.label,
      icon: route.icon,
      keywords: this.generateKeywords(route),
      category: 'Navigation',
      action: () => this.router.navigate({ to: route.path }),
      source: 'core' as const,
      path: route.path,
      pinyin: this.generatePinyin(route.label)
    }))
  }

  /**
   * 生成搜索关键词
   */
  private generateKeywords(route: AppRouteItem): string[] {
    const keywords = [route.label, route.path, ...this.generatePinyin(route.label)]

    // 添加英文翻译（如果可用）
    const englishTranslations = this.getEnglishTranslations(route.label)
    keywords.push(...englishTranslations)

    return keywords
  }

  /**
   * 生成拼音
   */
  private generatePinyin(text: string): string[] {
    try {
      return [
        pinyin(text, { toneType: 'none', type: 'array' }).join(''),
        pinyin(text, { toneType: 'none', type: 'array' }).join(' ')
      ]
    } catch (error) {
      console.warn('Failed to generate pinyin for:', text, error)
      return []
    }
  }

  /**
   * 获取英文翻译
   * 这里可以根据实际的翻译键来获取对应的英文翻译
   */
  private getEnglishTranslations(chineseLabel: string): string[] {
    // 简单的映射，实际项目中可以通过翻译系统获取
    const translations: Record<string, string[]> = {
      仪表盘: ['dashboard', 'overview'],
      文件管理: ['files', 'file management'],
      项目管理: ['projects', 'project management'],
      赛事中心: ['competitions', 'contest center'],
      经费追踪: ['expenses', 'expense tracking'],
      设置: ['settings', 'preferences'],
      关于: ['about']
    }

    return translations[chineseLabel] || []
  }

  /**
   * 初始化 Fuse.js 搜索引擎
   */
  private initializeFuse() {
    const fuseOptions: IFuseOptions<RouteCommand> = {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'keywords', weight: 0.3 },
        { name: 'path', weight: 0.2 },
        { name: 'pinyin', weight: 0.4 }
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: true
    }

    this.fuse = new Fuse(this.routes, fuseOptions)
  }
}

/**
 * 路由注册表 Hook
 *
 * 功能：
 * - 管理 RouteRegistry 实例的生命周期
 * - 自动更新路由当翻译变化时
 * - 与 React 组件生命周期集成
 */
export function useRouteRegistry(router: Router<any, any>) {
  const routeRegistryRef = useRef<RouteRegistry | null>(null)
  const { flatRoutes } = useTranslatedRoutes()

  // 初始化路由注册表
  if (!routeRegistryRef.current) {
    routeRegistryRef.current = new RouteRegistry(router)
  }

  // 当翻译路由更新时，更新注册表
  useEffect(() => {
    if (routeRegistryRef.current && flatRoutes) {
      routeRegistryRef.current.updateRoutes(flatRoutes)
    }
  }, [flatRoutes])

  return routeRegistryRef.current
}
