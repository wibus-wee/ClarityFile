/**
 * 防抖 composable
 * 用于延迟执行函数，避免频繁调用
 */

import { ref, watch, type Ref } from 'vue'

/**
 * 防抖值 composable
 * @param value 要防抖的响应式值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的响应式值
 */
export function useDebouncedRef<T>(value: Ref<T>, delay: number = 300): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeoutId: NodeJS.Timeout | null = null

  watch(
    value,
    (newValue) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        debouncedValue.value = newValue
        timeoutId = null
      }, delay)
    },
    { immediate: false }
  )

  return debouncedValue
}

/**
 * 防抖函数 composable
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function useDebouncedFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): T {
  let timeoutId: NodeJS.Timeout | null = null

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }) as T

  return debouncedFn
}

/**
 * 可取消的防抖函数 composable
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 包含防抖函数和取消函数的对象
 */
export function useCancellableDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout | null = null

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }) as T

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const flush = (...args: Parameters<T>) => {
    cancel()
    fn(...args)
  }

  return {
    debouncedFn,
    cancel,
    flush
  }
}

/**
 * 搜索防抖 composable
 * 专门用于搜索场景的防抖处理
 * @param initialValue 初始搜索值
 * @param delay 防抖延迟时间（毫秒）
 * @returns 搜索相关的响应式状态和方法
 */
export function useSearchDebounce(initialValue: string = '', delay: number = 300) {
  const searchQuery = ref(initialValue)
  const debouncedSearchQuery = ref(initialValue)
  const isSearching = ref(false)
  
  let timeoutId: NodeJS.Timeout | null = null

  // 监听搜索查询变化
  watch(
    searchQuery,
    (newQuery) => {
      isSearching.value = true
      
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        debouncedSearchQuery.value = newQuery
        isSearching.value = false
        timeoutId = null
      }, delay)
    },
    { immediate: false }
  )

  // 立即搜索（跳过防抖）
  const searchImmediately = (query?: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    
    if (query !== undefined) {
      searchQuery.value = query
    }
    
    debouncedSearchQuery.value = searchQuery.value
    isSearching.value = false
  }

  // 清空搜索
  const clearSearch = () => {
    searchQuery.value = ''
    searchImmediately('')
  }

  // 取消当前防抖
  const cancelSearch = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    isSearching.value = false
  }

  return {
    searchQuery,
    debouncedSearchQuery: readonly(debouncedSearchQuery),
    isSearching: readonly(isSearching),
    searchImmediately,
    clearSearch,
    cancelSearch
  }
}

/**
 * 节流函数 composable
 * 限制函数在指定时间内只能执行一次
 * @param fn 要节流的函数
 * @param delay 节流间隔时间（毫秒）
 * @returns 节流后的函数
 */
export function useThrottledFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): T {
  let lastExecTime = 0
  let timeoutId: NodeJS.Timeout | null = null

  const throttledFn = ((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastExecTime >= delay) {
      lastExecTime = now
      fn(...args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastExecTime = Date.now()
        fn(...args)
        timeoutId = null
      }, delay - (now - lastExecTime))
    }
  }) as T

  return throttledFn
}

/**
 * 自适应防抖 composable
 * 根据输入频率自动调整防抖延迟
 * @param fn 要防抖的函数
 * @param minDelay 最小延迟时间（毫秒）
 * @param maxDelay 最大延迟时间（毫秒）
 * @returns 自适应防抖函数
 */
export function useAdaptiveDebounce<T extends (...args: any[]) => any>(
  fn: T,
  minDelay: number = 100,
  maxDelay: number = 1000
): T {
  let timeoutId: NodeJS.Timeout | null = null
  let lastCallTime = 0
  let callCount = 0
  const resetInterval = 2000 // 重置计数的时间间隔

  const adaptiveDebouncedFn = ((...args: Parameters<T>) => {
    const now = Date.now()
    
    // 重置计数器
    if (now - lastCallTime > resetInterval) {
      callCount = 0
    }
    
    callCount++
    lastCallTime = now
    
    // 根据调用频率计算延迟时间
    const adaptiveDelay = Math.min(
      maxDelay,
      Math.max(minDelay, minDelay + (callCount - 1) * 50)
    )

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, adaptiveDelay)
  }) as T

  return adaptiveDebouncedFn
}
