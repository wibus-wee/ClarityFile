import Fuse from 'fuse.js'
import type {
  SearchableItem,
  SearchResult,
  SearchOptions,
  SearchEngineConfig
} from '../types/command-box.types'

/**
 * 智能搜索引擎
 * 基于 Fuse.js 实现模糊搜索，支持权重排序和智能匹配
 */
export class SearchEngine {
  private fuse: Fuse<SearchableItem>
  private config: SearchEngineConfig
  private recentItems: Map<string, number> = new Map()
  private usageStats: Map<string, number> = new Map()

  constructor(config?: Partial<SearchEngineConfig>) {
    this.config = {
      threshold: 0.3,
      keys: ['title', 'description', 'content', 'tags', 'keywords'],
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 1,
      maxResults: 50,
      ...config
    }

    this.fuse = new Fuse([], {
      threshold: this.config.threshold,
      keys: this.config.keys,
      includeScore: this.config.includeScore,
      includeMatches: this.config.includeMatches,
      minMatchCharLength: this.config.minMatchCharLength,
      ignoreLocation: true,
      findAllMatches: true
    })
  }

  /**
   * 执行搜索
   */
  search(query: string, items: SearchableItem[], options?: SearchOptions): SearchResult[] {
    if (!query.trim()) return []

    // 更新搜索数据源
    this.fuse.setCollection(items)

    // 执行模糊搜索
    const fuseResults = this.fuse.search(query, {
      limit: options?.limit || this.config.maxResults
    })

    // 转换为搜索结果
    const results: SearchResult[] = fuseResults.map((result) => ({
      ...result.item,
      score: result.score,
      matches: result.matches?.map((match) => ({
        key: match.key || '',
        value: match.value || '',
        indices: match.indices.map(([start, end]) => [start, end] as [number, number])
      }))
    }))

    // 应用智能排序
    return this.applyIntelligentSorting(results, query, options)
  }

  /**
   * 智能排序算法
   * 综合考虑搜索匹配度、使用频率、最近访问等因素
   */
  private applyIntelligentSorting(
    results: SearchResult[],
    query: string,
    options?: SearchOptions
  ): SearchResult[] {
    return results
      .map((result) => ({
        ...result,
        finalScore: this.calculateFinalScore(result, query)
      }))
      .sort((a, b) => (a.finalScore || 0) - (b.finalScore || 0))
      .slice(0, options?.limit || this.config.maxResults)
  }

  /**
   * 计算最终评分
   * 权重分配：搜索匹配度(50%) + 使用频率(30%) + 最近访问(20%)
   */
  private calculateFinalScore(result: SearchResult, query: string): number {
    const baseScore = result.score || 0
    const usageWeight = this.getUsageWeight(result.id)
    const recentWeight = this.getRecentWeight(result.id)
    const exactMatchBonus = this.getExactMatchBonus(result, query)

    return (
      baseScore * 0.5 + usageWeight * 0.3 + recentWeight * 0.2 - exactMatchBonus // 减分表示更好的匹配
    )
  }

  /**
   * 获取使用频率权重
   */
  private getUsageWeight(itemId: string): number {
    const usage = this.usageStats.get(itemId) || 0
    const maxUsage = Math.max(...Array.from(this.usageStats.values()), 1)
    return usage / maxUsage
  }

  /**
   * 获取最近访问权重
   */
  private getRecentWeight(itemId: string): number {
    const timestamp = this.recentItems.get(itemId) || 0
    const now = Date.now()
    const dayInMs = 24 * 60 * 60 * 1000
    const daysSince = (now - timestamp) / dayInMs

    // 最近7天内访问的项目给予权重加成
    if (daysSince <= 7) {
      return 1 - daysSince / 7
    }
    return 0
  }

  /**
   * 获取精确匹配加成
   */
  private getExactMatchBonus(result: SearchResult, query: string): number {
    const lowerQuery = query.toLowerCase()
    const lowerTitle = result.title.toLowerCase()

    // 完全匹配
    if (lowerTitle === lowerQuery) return 0.5

    // 开头匹配
    if (lowerTitle.startsWith(lowerQuery)) return 0.3

    // 包含匹配
    if (lowerTitle.includes(lowerQuery)) return 0.1

    return 0
  }

  /**
   * 更新使用统计
   */
  updateUsageStats(itemId: string): void {
    const current = this.usageStats.get(itemId) || 0
    this.usageStats.set(itemId, current + 1)
  }

  /**
   * 更新最近访问
   */
  updateRecentAccess(itemId: string): void {
    this.recentItems.set(itemId, Date.now())
  }

  /**
   * 批量更新统计数据
   */
  updateStats(
    usageStats: Record<string, number>,
    recentItems: Array<{ id: string; timestamp: number }>
  ): void {
    // 更新使用统计
    Object.entries(usageStats).forEach(([id, count]) => {
      this.usageStats.set(id, count)
    })

    // 更新最近访问
    recentItems.forEach((item) => {
      this.recentItems.set(item.id, item.timestamp)
    })
  }

  /**
   * 高亮搜索结果
   */
  highlightMatches(text: string, matches?: Array<{ indices: [number, number][] }>): string {
    if (!matches || matches.length === 0) return text

    const allIndices: [number, number][] = []
    matches.forEach((match) => {
      allIndices.push(...match.indices)
    })

    // 按起始位置排序
    allIndices.sort((a, b) => a[0] - b[0])

    // 合并重叠的区间
    const mergedIndices = this.mergeOverlappingIndices(allIndices)

    // 从后往前插入高亮标记，避免位置偏移
    let result = text
    for (let i = mergedIndices.length - 1; i >= 0; i--) {
      const [start, end] = mergedIndices[i]
      const before = result.slice(0, start)
      const match = result.slice(start, end + 1)
      const after = result.slice(end + 1)
      result = `${before}<mark>${match}</mark>${after}`
    }

    return result
  }

  /**
   * 合并重叠的索引区间
   */
  private mergeOverlappingIndices(indices: [number, number][]): [number, number][] {
    if (indices.length === 0) return []

    const merged: [number, number][] = [indices[0]]

    for (let i = 1; i < indices.length; i++) {
      const current = indices[i]
      const last = merged[merged.length - 1]

      if (current[0] <= last[1] + 1) {
        // 重叠或相邻，合并
        last[1] = Math.max(last[1], current[1])
      } else {
        // 不重叠，添加新区间
        merged.push(current)
      }
    }

    return merged
  }

  /**
   * 重置搜索引擎
   */
  reset(): void {
    this.recentItems.clear()
    this.usageStats.clear()
    this.fuse.setCollection([])
  }
}
