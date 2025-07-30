import { useMemo } from 'react'
import { useAllCommands } from '../stores/command-palette-store'
import { useFavoritesData } from './use-command-palette-data'
import type { Command } from '../types'

/**
 * 推荐算法配置接口
 */
export interface RecommendationConfig {
  /** 频率权重 (0-1) */
  frequencyWeight: number
  /** 时间权重 (0-1) */
  recencyWeight: number
  /** 上下文权重 (0-1) */
  contextWeight: number
  /** 时间衰减半衰期，单位天 */
  decayHalfLife: number
  /** 最大建议数量 */
  maxSuggestions: number
  /** 是否启用调试模式 */
  debugMode: boolean
}

/**
 * 默认推荐配置
 */
export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationConfig = {
  frequencyWeight: 0.4,
  recencyWeight: 0.4,
  contextWeight: 0.2,
  decayHalfLife: 7, // 7天半衰期
  maxSuggestions: 5,
  debugMode: false
}

/**
 * 推荐命令接口（包含评分详情）
 */
export interface RecommendedCommand {
  command: Command
  score: number
  breakdown: {
    frequencyScore: number
    recencyScore: number
    contextScore: number
    reason: string
  }
}

/**
 * 推荐算法工具函数
 */
export const recommendationUtils = {
  /**
   * 计算时间衰减评分
   * 使用指数衰减函数：score = 0.5^(daysSince / halfLife)
   */
  calculateRecencyScore: (timestamp: number, halfLife: number): number => {
    const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
    return Math.pow(0.5, daysSince / halfLife)
  },

  /**
   * 计算频率评分
   * 归一化到 0-1 范围，使用对数缩放避免极值
   */
  calculateFrequencyScore: (frequency: number, maxFrequency: number): number => {
    if (maxFrequency === 0) return 0
    // 使用对数缩放，避免高频命令完全压制低频命令
    const normalizedFreq = frequency / maxFrequency
    return Math.log(1 + normalizedFreq * 9) / Math.log(10) // log10(1 + 9x)
  },

  /**
   * 计算上下文评分
   * 基于时间段、工作模式等因素
   */
  calculateContextScore: (command: Command): number => {
    const now = new Date()
    const hour = now.getHours()

    // 简单的时间段匹配
    const isWorkingHours = hour >= 9 && hour <= 18

    // 根据命令类型和时间段给出不同评分
    if (command.keywords.some((k) => ['设置', 'settings'].includes(k.toLowerCase()))) {
      // 设置类命令在非工作时间评分更高
      return isWorkingHours ? 0.3 : 0.8
    }

    if (
      command.keywords.some((k) => ['文件', 'file', '项目', 'project'].includes(k.toLowerCase()))
    ) {
      // 工作相关命令在工作时间评分更高
      return isWorkingHours ? 0.8 : 0.4
    }

    // 默认评分
    return 0.5
  },

  /**
   * 生成推荐理由
   */
  generateReason: (breakdown: RecommendedCommand['breakdown']): string => {
    const { frequencyScore, recencyScore, contextScore } = breakdown

    if (frequencyScore > 0.7) {
      return '经常使用'
    } else if (recencyScore > 0.7) {
      return '最近使用'
    } else if (contextScore > 0.7) {
      return '当前时段推荐'
    } else if (frequencyScore > 0.4 && recencyScore > 0.4) {
      return '常用且最近使用'
    } else {
      return '推荐尝试'
    }
  }
}

/**
 * 命令推荐 Hook
 *
 * 功能：
 * - 基于用户行为数据生成智能推荐
 * - 支持可配置的推荐算法参数
 * - 提供评分详情用于调试和优化
 * - 结合频率、时间衰减和上下文因素
 */
export function useCommandRecommendations(config: Partial<RecommendationConfig> = {}) {
  const allCommands = useAllCommands()
  const { recentCommands } = useFavoritesData()

  // 合并配置
  const finalConfig = useMemo(() => {
    return { ...DEFAULT_RECOMMENDATION_CONFIG, ...config }
  }, [config])

  // 计算推荐命令
  const recommendations = useMemo(() => {
    if (!recentCommands || recentCommands.length === 0) {
      return []
    }

    // 计算最大频率用于归一化
    const maxFrequency = Math.max(...recentCommands.map((cmd: any) => cmd.frequency))

    // 为每个最近使用的命令计算评分
    const scoredCommands: RecommendedCommand[] = recentCommands
      .map((recentCmd: any) => {
        // 查找对应的命令对象
        const command = allCommands.find((cmd) => cmd.id === recentCmd.commandId)
        if (!command) return null

        // 计算各项评分
        const frequencyScore = recommendationUtils.calculateFrequencyScore(
          recentCmd.frequency,
          maxFrequency
        )
        const recencyScore = recommendationUtils.calculateRecencyScore(
          recentCmd.timestamp,
          finalConfig.decayHalfLife
        )
        const contextScore = recommendationUtils.calculateContextScore(command)

        // 计算总评分
        const score =
          frequencyScore * finalConfig.frequencyWeight +
          recencyScore * finalConfig.recencyWeight +
          contextScore * finalConfig.contextWeight

        const breakdown = {
          frequencyScore,
          recencyScore,
          contextScore,
          reason: recommendationUtils.generateReason({
            frequencyScore,
            recencyScore,
            contextScore,
            reason: ''
          })
        }

        return {
          command,
          score,
          breakdown
        }
      })
      .filter((item): item is RecommendedCommand => item !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, finalConfig.maxSuggestions)

    return scoredCommands
  }, [allCommands, recentCommands, finalConfig])

  return {
    recommendations,
    config: finalConfig,
    utils: recommendationUtils
  }
}
