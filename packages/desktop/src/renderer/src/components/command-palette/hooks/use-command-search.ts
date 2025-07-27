import { useMemo } from 'react'
import {
  useSearchResults,
  useSearchableCommands,
  useCommandPaletteQuery,
  useCommandPaletteActions
} from '../stores/command-palette-store'

/**
 * 统一的命令搜索 Hook
 *
 * 设计原则：
 * 1. 使用计算式selectors，不存储computed state
 * 2. 提供防抖功能，但不在store中处理
 * 3. 保持hook的纯粹性
 */
export function useCommandSearch() {
  const query = useCommandPaletteQuery()
  const { setQuery } = useCommandPaletteActions()

  // ✅ 实时计算搜索结果（通过selector）
  const searchResults = useSearchResults()
  const searchableCommands = useSearchableCommands()

  // ✅ 计算派生状态
  const hasResults = searchResults.length > 0
  const hasQuery = query.trim().length > 0

  // ✅ 提供"Use with..."的候选命令
  const useWithCandidates = useMemo(() => {
    if (!hasQuery || hasResults) return []

    return searchableCommands.filter(
      (command) => 'canHandleQuery' in command && command.canHandleQuery?.(query)
    )
  }, [hasQuery, hasResults, searchableCommands, query])

  return {
    // 状态
    query,
    searchResults,
    searchableCommands,
    useWithCandidates,

    // 计算属性
    hasResults,
    hasQuery,
    showUseWith: hasQuery && !hasResults && useWithCandidates.length > 0,

    // 操作
    setQuery
  }
}
