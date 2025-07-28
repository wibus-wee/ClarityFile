import Fuse, { type IFuseOptions } from 'fuse.js'
import type { Command, RouteCommand } from '../types'

/**
 * Fuse.js 搜索配置 - 支持拼音搜索
 */
const FUSE_OPTIONS: IFuseOptions<Command> = {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'keywords', weight: 0.3 },
    { name: 'category', weight: 0.2 },
    { name: 'pinyin', weight: 0.4 }
  ],
  threshold: 0.4,
  includeScore: true,
  ignoreLocation: true,
  findAllMatches: true
}

/**
 * 路由命令专用搜索配置
 */
const ROUTE_FUSE_OPTIONS: IFuseOptions<RouteCommand> = {
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

/**
 * 使用Fuse.js进行模糊搜索
 */
export function fuzzySearch<T extends Command>(
  items: T[],
  query: string,
  options?: Partial<IFuseOptions<T>>
): T[] {
  if (!query.trim()) return []

  const fuse = new Fuse(items, { ...FUSE_OPTIONS, ...options })
  const results = fuse.search(query)
  return results.map((result) => result.item)
}

/**
 * 搜索路由命令
 */
export function searchRouteCommands(routes: RouteCommand[], query: string): RouteCommand[] {
  if (!query.trim()) return routes

  const fuse = new Fuse(routes, ROUTE_FUSE_OPTIONS)
  const results = fuse.search(query)
  return results.map((result) => result.item)
}

/**
 * 搜索所有命令
 */
export function searchAllCommands(commands: Command[], query: string): Command[] {
  return fuzzySearch(commands, query)
}

/**
 * 简单文本搜索（备用方案）
 */
export function simpleSearch<T extends Command>(items: T[], query: string): T[] {
  if (!query.trim()) return []

  const lowerQuery = query.toLowerCase()

  return items.filter((item) => {
    const searchText = [item.title, item.subtitle || '', item.category || '', ...item.keywords]
      .join(' ')
      .toLowerCase()

    return searchText.includes(lowerQuery)
  })
}
