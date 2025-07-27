import { pinyin } from 'pinyin-pro'
import type { Router } from '@tanstack/react-router'
import type { AppRouteItem } from '@renderer/routers'
import type { RouteCommand } from '../types'

/**
 * 生成拼音关键词
 */
export function generatePinyin(text: string): string[] {
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
 * 获取英文翻译关键词
 * 这里可以根据实际的翻译键来获取对应的英文翻译
 */
export function getEnglishTranslations(chineseLabel: string): string[] {
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
 * 生成路由搜索关键词
 */
export function generateRouteKeywords(route: AppRouteItem): string[] {
  const keywords = [
    route.label,
    route.path,
    ...generatePinyin(route.label),
    ...getEnglishTranslations(route.label)
  ]

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
