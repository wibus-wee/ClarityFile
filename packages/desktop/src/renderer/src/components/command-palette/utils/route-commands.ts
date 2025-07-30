import { pinyin } from 'pinyin-pro'
import type { Router } from '@tanstack/react-router'
import type { AppRouteItem } from '@renderer/routers'
import type { RouteCommand } from '../types'

/**
 * 生成拼音关键词
 */
export function generatePinyin(text: string): string[] {
  try {
    const pinyinArray = pinyin(text, { toneType: 'none', type: 'array' })

    return [
      // 完整拼音连写：sousuowenjian
      pinyinArray.join(''),
      // 完整拼音空格分隔：sousuo wenjian
      pinyinArray.join(' '),
      // 首字母连写：sswj
      pinyinArray.map((p) => p.charAt(0)).join(''),
      // 首字母空格分隔：s s w j
      pinyinArray.map((p) => p.charAt(0)).join(' ')
    ]
  } catch (error) {
    console.warn('Failed to generate pinyin for:', text, error)
    return []
  }
}

/**
 * 生成路由搜索关键词
 */
export function generateRouteKeywords(route: AppRouteItem): string[] {
  const keywords = [route.label, route.path, ...generatePinyin(route.label)]

  return keywords
}

/**
 * 创建路由命令 - 纯函数替换RouteRegistry类
 */
export function createRouteCommands(
  routes: AppRouteItem[],
  router: Router<any, any>
): RouteCommand[] {
  return routes.map((route) => ({
    id: `route:${route.path}`,
    title: route.label,
    icon: route.icon,
    keywords: generateRouteKeywords(route),
    category: 'Navigation',
    action: () => router.navigate({ to: route.path }),
    source: 'core' as const,
    path: route.path,
    pinyin: generatePinyin(route.label)
  }))
}
