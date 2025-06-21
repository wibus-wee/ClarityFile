import { BrowserWindow } from 'electron'
import { getRendererHandlers } from '@egoist/tipc/main'

/**
 * 通用 TIPC 事件发送器类
 */
export class TipcEventSender<T extends Record<string, (...args: any[]) => void>> {
  private handlers: ReturnType<typeof getRendererHandlers<T>> | null = null
  private mainWindow: BrowserWindow | null = null

  initialize(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.handlers = getRendererHandlers<T>(mainWindow.webContents)
    console.log('TipcEventSender 初始化完成')
  }

  private ensureInitialized() {
    if (!this.handlers || !this.mainWindow) {
      throw new Error('TipcEventSender 未初始化，请先调用 initialize() 方法')
    }
  }

  send<K extends keyof T>(eventName: K, data: Parameters<T[K]>[0]) {
    this.ensureInitialized()

    try {
      ;(this.handlers![eventName] as any).send(data)
      console.log(`[TipcEventSender] 发送事件: ${String(eventName)}`)
    } catch (error) {
      console.error(`发送事件 ${String(eventName)} 失败:`, error)
    }
  }

  async invoke<K extends keyof T>(eventName: K, data: Parameters<T[K]>[0]) {
    this.ensureInitialized()

    try {
      const result = await (this.handlers![eventName] as any).invoke(data)
      console.log(`[TipcEventSender] 调用事件: ${String(eventName)}`)
      return result
    } catch (error) {
      console.error(`调用事件 ${String(eventName)} 失败:`, error)
      throw error
    }
  }

  /**
   * 检查是否已初始化
   */
  get isInitialized(): boolean {
    return this.handlers !== null && this.mainWindow !== null
  }

  /**
   * 获取主窗口实例
   */
  get window(): BrowserWindow | null {
    return this.mainWindow
  }
}

/**
 * 创建事件发送器实例的工厂函数
 * @template T 渲染进程事件处理器类型定义
 * @returns 新的事件发送器实例
 */
export function createEventSender<
  T extends Record<string, (...args: any[]) => void>
>(): TipcEventSender<T> {
  return new TipcEventSender<T>()
}

/**
 * 全局事件发送器管理器
 * 用于管理多个事件发送器实例
 */
export class EventSenderManager {
  private static instance: EventSenderManager
  private senders: Map<string, TipcEventSender<any>> = new Map()

  // private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): EventSenderManager {
    if (!EventSenderManager.instance) {
      EventSenderManager.instance = new EventSenderManager()
    }
    return EventSenderManager.instance
  }

  /**
   * 注册事件发送器
   * @param name 发送器名称
   * @param sender 事件发送器实例
   */
  register<T extends Record<string, (...args: any[]) => void>>(
    name: string,
    sender: TipcEventSender<T>
  ): void {
    this.senders.set(name, sender)
    console.log(`[EventSenderManager] 注册事件发送器: ${name}`)
  }

  /**
   * 获取事件发送器
   * @param name 发送器名称
   * @returns 事件发送器实例
   */
  get<T extends Record<string, (...args: any[]) => void>>(name: string): TipcEventSender<T> | null {
    return this.senders.get(name) || null
  }

  /**
   * 初始化所有已注册的事件发送器
   * @param mainWindow 主窗口实例
   */
  initializeAll(mainWindow: BrowserWindow): void {
    for (const [name, sender] of this.senders) {
      try {
        sender.initialize(mainWindow)
        console.log(`[EventSenderManager] 初始化事件发送器: ${name}`)
      } catch (error) {
        console.error(`[EventSenderManager] 初始化事件发送器 ${name} 失败:`, error)
      }
    }
  }

  /**
   * 获取所有已注册的发送器名称
   */
  getRegisteredNames(): string[] {
    return Array.from(this.senders.keys())
  }
}
