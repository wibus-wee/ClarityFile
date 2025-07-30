import Fuse, { type IFuseOptions } from 'fuse.js'
import type { Command, RouteCommand, RecentCommand } from '../types'

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

/**
 * 计算命令使用频率评分
 */
function calculateUsageScore(commandId: string, recentCommands: RecentCommand[]): number {
  const recentCommand = recentCommands.find((cmd) => cmd.commandId === commandId)
  if (!recentCommand) return 0

  // 计算频率评分（归一化）
  const maxFrequency = Math.max(...recentCommands.map((cmd) => cmd.frequency))
  const frequencyScore = maxFrequency > 0 ? recentCommand.frequency / maxFrequency : 0

  // 计算时间衰减评分（7天半衰期）
  const daysSince = (Date.now() - recentCommand.timestamp) / (1000 * 60 * 60 * 24)
  const recencyScore = Math.pow(0.5, daysSince / 7)

  // 综合评分：频率权重 0.6，时间权重 0.4
  return frequencyScore * 0.6 + recencyScore * 0.4
}

/**
 * 增强的模糊搜索 - 结合文本匹配和使用频率
 */
export function enhancedFuzzySearch<T extends Command>(
  items: T[],
  query: string,
  recentCommands: RecentCommand[] = [],
  options?: Partial<IFuseOptions<T>>
): T[] {
  if (!query.trim()) return []

  const fuse = new Fuse(items, { ...FUSE_OPTIONS, ...options })
  const results = fuse.search(query)

  // 为每个结果计算综合评分
  const scoredResults = results.map((result) => {
    const textScore = 1 - (result.score || 0) // Fuse.js 分数越低越好，转换为越高越好
    const usageScore = calculateUsageScore(result.item.id, recentCommands)

    // 综合评分：文本匹配权重 0.7，使用频率权重 0.3
    const finalScore = textScore * 0.7 + usageScore * 0.3

    return {
      item: result.item,
      score: finalScore
    }
  })

  // 按综合评分排序并返回命令
  return scoredResults.sort((a, b) => b.score - a.score).map((result) => result.item)
}
