import { createEventHandlers } from '@egoist/tipc/renderer'
import { useEffect, useCallback, useRef } from 'react'

/**
 * 创建 TIPC 事件处理器
 */
export function createTipcEventHandlers<T extends Record<string, (...args: any[]) => void>>() {
  return createEventHandlers<T>({
    on: window.api.ipcOn,
    send: window.api.ipcSend
  })
}

/**
 * React Hook: 监听 TIPC 事件
 */
export function useTipcEvent<T extends Record<string, (...args: any[]) => void>>(
  handlers: ReturnType<typeof createEventHandlers<T>>,
  eventName: keyof T,
  callback: T[keyof T]
) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // 使用 useCallback 稳定包装函数引用
  const wrappedCallback = useCallback((...args: any[]) => {
    callbackRef.current(...args)
  }, [])

  useEffect(() => {
    const unlisten = handlers[eventName].listen(wrappedCallback as T[keyof T])
    return unlisten
  }, [handlers, eventName, wrappedCallback])
}

/**
 * React Hook: 处理 TIPC 事件调用
 */
export function useTipcEventHandler<T extends Record<string, (...args: any[]) => any>>(
  handlers: ReturnType<typeof createEventHandlers<T>>,
  eventName: keyof T,
  handler: T[keyof T]
) {
  const handlerRef = useRef(handler)

  // 更新处理器引用
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  // 使用 useCallback 稳定包装函数引用
  const wrappedHandler = useCallback((...args: any[]) => {
    return handlerRef.current(...args)
  }, [])

  useEffect(() => {
    const unlisten = handlers[eventName].handle(wrappedHandler as T[keyof T])
    return unlisten
  }, [handlers, eventName, wrappedHandler])
}

/**
 * 事件监听器管理器 (改进版单例模式)
 */
export class EventListenerManager {
  private static instance: EventListenerManager
  private handlers = new Map<string, ReturnType<typeof createEventHandlers<any>>>()

  private constructor() {
    // 单例模式
  }

  static getInstance() {
    if (!EventListenerManager.instance) {
      EventListenerManager.instance = new EventListenerManager()
    }
    return EventListenerManager.instance
  }

  register<T extends Record<string, (...args: any[]) => void>>(
    name: string,
    handlers: ReturnType<typeof createEventHandlers<T>>
  ) {
    this.handlers.set(name, handlers)
    console.log(`[EventListenerManager] 注册事件处理器: ${name}`)
  }

  get<T extends Record<string, (...args: any[]) => void>>(name: string) {
    return this.handlers.get(name) as ReturnType<typeof createEventHandlers<T>> | null
  }

  getRegisteredNames() {
    return Array.from(this.handlers.keys())
  }
}

/**
 * 创建并注册事件处理器的便捷函数
 */
export function createAndRegisterEventHandlers<T extends Record<string, (...args: any[]) => void>>(
  name: string
) {
  const handlers = createTipcEventHandlers<T>()
  EventListenerManager.getInstance().register(name, handlers)
  return handlers
}

/**
 * React Hook: 获取已注册的事件处理器
 * 使用 useCallback 优化性能
 */
export function useEventHandlers<T extends Record<string, (...args: any[]) => void>>(name: string) {
  const getHandlers = useCallback(() => {
    return EventListenerManager.getInstance().get<T>(name)
  }, [name])

  return getHandlers()
}
