import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { tipcClient } from '@renderer/lib/tipc-client'
import {
  DEFAULT_RECOMMENDATION_CONFIG,
  type RecommendationConfig
} from './use-command-recommendations'

/**
 * 推荐配置管理 Hook
 *
 * 功能：
 * - 管理推荐算法的配置参数
 * - 支持实时配置更新
 * - 提供默认配置和重置功能
 */
export function useRecommendationConfig() {
  // 获取推荐配置
  const {
    data: config,
    isLoading,
    error
  } = useSWR(['command-palette-recommendation-config'], async () => {
    try {
      const result = await tipcClient.getSetting({
        key: 'command-palette.recommendation-config'
      })

      if (result?.value) {
        const savedConfig =
          typeof result.value === 'string' ? JSON.parse(result.value) : result.value

        // 合并保存的配置和默认配置，确保所有字段都存在
        return { ...DEFAULT_RECOMMENDATION_CONFIG, ...savedConfig }
      }

      return DEFAULT_RECOMMENDATION_CONFIG
    } catch (error) {
      console.warn('Failed to load recommendation config, using defaults:', error)
      return DEFAULT_RECOMMENDATION_CONFIG
    }
  })

  // 更新配置
  const { trigger: updateConfig, isMutating: isUpdating } = useSWRMutation(
    ['update-recommendation-config'],
    async (_key, { arg }: { arg: Partial<RecommendationConfig> }) => {
      const newConfig = { ...config, ...arg }

      const result = await tipcClient.setSetting({
        key: 'command-palette.recommendation-config',
        value: newConfig,
        category: 'command-palette',
        description: 'Command recommendation algorithm configuration',
        isUserModifiable: true
      })

      // 重新验证配置数据
      await tipcClient.getSetting({ key: 'command-palette.recommendation-config' })
      return result
    }
  )

  // 重置为默认配置
  const { trigger: resetConfig, isMutating: isResetting } = useSWRMutation(
    ['reset-recommendation-config'],
    async () => {
      const result = await tipcClient.setSetting({
        key: 'command-palette.recommendation-config',
        value: DEFAULT_RECOMMENDATION_CONFIG,
        category: 'command-palette',
        description: 'Command recommendation algorithm configuration',
        isUserModifiable: true
      })

      // 重新验证配置数据
      await tipcClient.getSetting({ key: 'command-palette.recommendation-config' })
      return result
    }
  )

  return {
    // 数据
    config: config || DEFAULT_RECOMMENDATION_CONFIG,
    isLoading,
    error,

    // 操作
    updateConfig,
    resetConfig,

    // 状态
    isUpdating,
    isResetting
  }
}

/**
 * 推荐配置验证工具
 */
export const configValidation = {
  /**
   * 验证权重配置（所有权重应该在 0-1 范围内）
   */
  validateWeights: (config: RecommendationConfig): boolean => {
    const { frequencyWeight, recencyWeight, contextWeight } = config
    return (
      frequencyWeight >= 0 &&
      frequencyWeight <= 1 &&
      recencyWeight >= 0 &&
      recencyWeight <= 1 &&
      contextWeight >= 0 &&
      contextWeight <= 1
    )
  },

  /**
   * 验证权重总和（建议总和接近 1.0，但不强制）
   */
  validateWeightSum: (config: RecommendationConfig): { isValid: boolean; sum: number } => {
    const sum = config.frequencyWeight + config.recencyWeight + config.contextWeight
    return {
      isValid: sum > 0.5 && sum <= 1.5, // 允许一定的灵活性
      sum
    }
  },

  /**
   * 验证其他参数
   */
  validateOtherParams: (config: RecommendationConfig): boolean => {
    return config.decayHalfLife > 0 && config.maxSuggestions > 0 && config.maxSuggestions <= 10
  },

  /**
   * 完整配置验证
   */
  validateConfig: (config: RecommendationConfig): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!configValidation.validateWeights(config)) {
      errors.push('权重值必须在 0-1 范围内')
    }

    const weightSum = configValidation.validateWeightSum(config)
    if (!weightSum.isValid) {
      errors.push(`权重总和 (${weightSum.sum.toFixed(2)}) 应该在 0.5-1.5 范围内`)
    }

    if (!configValidation.validateOtherParams(config)) {
      errors.push('衰减半衰期必须大于 0，最大建议数量必须在 1-10 范围内')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
