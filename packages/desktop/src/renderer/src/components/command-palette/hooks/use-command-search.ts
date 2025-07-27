import { useCommandPaletteStore } from '../stores/command-palette-store'

/**
 * 统一的命令搜索 Hook
 *
 * 功能：
 * - 提供搜索结果访问
 * - 提供查询状态管理
 * - 提供搜索相关的便捷方法
 */
export function useCommandSearch() {
  const searchResults = useCommandPaletteStore((state) => state.searchResults)
  const query = useCommandPaletteStore((state) => state.query)
  const setQuery = useCommandPaletteStore((state) => state.actions.setQuery)
  const searchableCommands = useCommandPaletteStore((state) => state.searchableCommands)

  return {
    searchResults,
    query,
    setQuery,
    searchableCommands,
    hasResults: searchResults.length > 0,
    hasQuery: query.trim().length > 0
  }
}
