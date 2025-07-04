import { useEffect, useState, useCallback } from 'react'
import { useCommandBox } from '../stores/command-box-store'
import { useProjects } from '@renderer/hooks/use-tipc'
import type { SuggestionItem } from '../types/command-box.types'

/**
 * 智能建议 Hook
 * 基于用户行为、时间和上下文生成智能建议
 */
export function useSuggestions() {
  const { recentItems, usageStats, searchHistory, setSuggestions } = useCommandBox()

  const { data: projects } = useProjects()
  const [isGenerating, setIsGenerating] = useState(false)

  // 生成基于时间的建议
  const generateTimeBasedSuggestions = useCallback((): SuggestionItem[] => {
    const suggestions: SuggestionItem[] = []
    const currentHour = new Date().getHours()
    const currentDay = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.

    // 工作时间建议 (9-18点)
    if (currentHour >= 9 && currentHour <= 18) {
      suggestions.push({
        id: 'suggestion-work-time',
        type: 'suggestion',
        title: '查看项目进度',
        description: '工作时间，建议查看项目状态和今日任务',
        confidence: 0.8,
        reason: '当前是工作时间',
        action: () => {
          // 导航到项目列表
          window.location.hash = '/projects'
        }
      })
    }

    // 周一建议
    if (currentDay === 1) {
      suggestions.push({
        id: 'suggestion-monday',
        type: 'suggestion',
        title: '制定本周计划',
        description: '新的一周开始，建议制定项目计划',
        confidence: 0.7,
        reason: '周一适合制定计划',
        action: () => {
          window.location.hash = '/projects'
        }
      })
    }

    // 周五建议
    if (currentDay === 5) {
      suggestions.push({
        id: 'suggestion-friday',
        type: 'suggestion',
        title: '整理本周成果',
        description: '周五了，建议整理本周的工作成果',
        confidence: 0.7,
        reason: '周五适合总结',
        action: () => {
          window.location.hash = '/files'
        }
      })
    }

    return suggestions
  }, [])

  // 生成基于使用频率的建议
  const generateUsageBasedSuggestions = useCallback((): SuggestionItem[] => {
    const suggestions: SuggestionItem[] = []

    // 获取最常用的功能
    const sortedUsage = Object.entries(usageStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    sortedUsage.forEach(([itemId, count], index) => {
      if (count > 5) {
        // 只有使用次数超过5次的才建议
        const recentItem = recentItems.find((item) => item.id === itemId)
        if (recentItem) {
          suggestions.push({
            id: `suggestion-frequent-${itemId}`,
            type: 'suggestion',
            title: `继续使用 ${recentItem.title}`,
            description: `您经常使用此功能 (${count} 次)`,
            confidence: Math.min(0.9, 0.5 + count / 20), // 基于使用次数计算置信度
            reason: `高频使用功能 (排名 ${index + 1})`,
            action: () => {
              if (recentItem.path) {
                window.location.hash = recentItem.path
              }
            }
          })
        }
      }
    })

    return suggestions
  }, [usageStats, recentItems])

  // 生成基于项目状态的建议
  const generateProjectBasedSuggestions = useCallback((): SuggestionItem[] => {
    const suggestions: SuggestionItem[] = []

    if (!projects || projects.length === 0) {
      // 如果没有项目，建议创建
      suggestions.push({
        id: 'suggestion-create-first-project',
        type: 'suggestion',
        title: '创建您的第一个项目',
        description: '开始使用 ClarityFile，创建您的第一个项目',
        confidence: 0.9,
        reason: '尚未创建任何项目',
        action: () => {
          window.location.hash = '/projects'
        }
      })
    } else {
      // 检查活跃项目
      const activeProjects = projects.filter((p) => p.status === 'active')

      if (activeProjects.length === 0) {
        suggestions.push({
          id: 'suggestion-activate-project',
          type: 'suggestion',
          title: '激活一个项目',
          description: '您有项目但都不是活跃状态，建议激活一个项目',
          confidence: 0.8,
          reason: '没有活跃的项目',
          action: () => {
            window.location.hash = '/projects'
          }
        })
      } else if (activeProjects.length > 5) {
        suggestions.push({
          id: 'suggestion-organize-projects',
          type: 'suggestion',
          title: '整理项目状态',
          description: `您有 ${activeProjects.length} 个活跃项目，建议整理项目状态`,
          confidence: 0.7,
          reason: '活跃项目过多',
          action: () => {
            window.location.hash = '/projects'
          }
        })
      }
    }

    return suggestions
  }, [projects])

  // 生成基于搜索历史的建议
  const generateSearchBasedSuggestions = useCallback((): SuggestionItem[] => {
    const suggestions: SuggestionItem[] = []

    if (searchHistory.length > 0) {
      // 获取最近的搜索词
      const recentSearches = searchHistory.slice(0, 3)

      recentSearches.forEach((query, index) => {
        suggestions.push({
          id: `suggestion-search-${index}`,
          type: 'suggestion',
          title: `搜索 "${query}"`,
          description: '基于您的搜索历史',
          confidence: 0.6 - index * 0.1, // 越新的搜索置信度越高
          reason: `最近搜索过 "${query}"`,
          action: () => {
            // 这里可以触发搜索
            // 注意：这里不能直接调用 hook，需要通过其他方式实现
            window.location.hash = `/search?q=${encodeURIComponent(query)}`
          }
        })
      })
    }

    return suggestions
  }, [searchHistory])

  // 生成所有建议
  const generateSuggestions = useCallback(async () => {
    setIsGenerating(true)

    try {
      const allSuggestions: SuggestionItem[] = [
        ...generateTimeBasedSuggestions(),
        ...generateUsageBasedSuggestions(),
        ...generateProjectBasedSuggestions(),
        ...generateSearchBasedSuggestions()
      ]

      // 按置信度排序并限制数量
      const sortedSuggestions = allSuggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5) // 最多显示5个建议

      setSuggestions(sortedSuggestions)
    } catch (error) {
      console.error('生成建议时出错:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [
    generateTimeBasedSuggestions,
    generateUsageBasedSuggestions,
    generateProjectBasedSuggestions,
    generateSearchBasedSuggestions,
    setSuggestions
  ])

  // 定期更新建议
  useEffect(() => {
    generateSuggestions()

    // 每5分钟更新一次建议
    const interval = setInterval(generateSuggestions, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [generateSuggestions])

  // 当相关数据变化时重新生成建议
  useEffect(() => {
    generateSuggestions()
  }, [projects, recentItems.length, usageStats, searchHistory.length])

  return {
    isGenerating,
    generateSuggestions
  }
}
