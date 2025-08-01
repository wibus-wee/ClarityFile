import useSWR from 'swr'
import type { Quote, HitokotoResponse, QuoteSource } from '@renderer/types/quote'
import { getRandomFallbackQuote } from '@renderer/data/fallback-quotes'

/**
 * 一言API请求函数
 * 优先获取文学(d)和哲学(k)分类的内容
 */
async function fetchHitokoto(): Promise<Quote> {
  const response = await fetch('https://v1.hitokoto.cn/?c=d&c=k&c=i', {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Hitokoto API error: ${response.status}`)
  }

  const data: HitokotoResponse = await response.json()

  return {
    id: data.uuid,
    content: data.hitokoto,
    author: data.from_who || undefined,
    source: data.from || undefined,
    category: getCategoryFromType(data.type),
    length: data.length
  }
}

/**
 * 获取动态文案的主函数
 * 优先使用一言API，失败时尝试Quotable API，最后使用本地数据
 */
async function fetchDynamicQuote(): Promise<Quote & { source: QuoteSource }> {
  try {
    if (import.meta.env.DEV) {
      throw new Error('Simulated Hitokoto API failure for avoiding hitokoto rate limit.')
    }
    const quote = await fetchHitokoto()
    return { ...quote, source: 'hitokoto' }
  } catch (error) {
    console.warn('Hitokoto API failed, trying Quotable API:', error)

    const fallbackQuote = getRandomFallbackQuote()
    return {
      id: `fallback-${Date.now()}`,
      content: fallbackQuote.content,
      author: fallbackQuote.author,
      source: (fallbackQuote.source as QuoteSource) || 'fallback',
      category: fallbackQuote.category,
      length: fallbackQuote.content.length
    }
  }
}

/**
 * 将一言API的类型转换为我们的分类
 */
function getCategoryFromType(type: string): string {
  const typeMap: Record<string, string> = {
    d: 'literature', // 文学
    k: 'philosophy', // 哲学
    i: 'wisdom', // 诗词
    e: 'academic', // 原创
    f: 'wisdom', // 网络
    g: 'wisdom' // 其他
  }
  return typeMap[type] || 'wisdom'
}

/**
 * 动态文案Hook
 */
export function useDynamicQuote() {
  const { data, error, isLoading, mutate } = useSWR('dynamic-quote', fetchDynamicQuote, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30 * 60 * 1000, // 30分钟自动刷新
    dedupingInterval: 5 * 60 * 1000, // 5分钟内去重
    errorRetryCount: 2,
    errorRetryInterval: 10000,
    // 提供初始fallback数据，避免首次加载时的空白状态
    fallbackData: (() => {
      const fallbackQuote = getRandomFallbackQuote()
      return {
        id: `initial-fallback-${Date.now()}`,
        content: fallbackQuote.content,
        author: fallbackQuote.author,
        source: (fallbackQuote.source || 'fallback') as QuoteSource,
        category: fallbackQuote.category,
        length: fallbackQuote.content.length
      }
    })(),
    // 自定义错误处理，确保总是有数据返回
    onError: (error) => {
      console.error('Dynamic quote fetch error:', error)
    }
  })

  return {
    quote: data,
    isLoading,
    error,
    refresh: () => mutate(), // 手动刷新
    isFromAPI: data?.source !== 'fallback'
  }
}
