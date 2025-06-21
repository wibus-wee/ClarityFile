import chokidar from 'chokidar'
import { EventEmitter } from 'events'
import type { ChokidarOptions, FSWatcher } from 'chokidar'
import type { Stats } from 'fs'
import { EventName } from 'chokidar/handler.js'

/**
 * Chokidar事件类型定义
 * 直接映射Chokidar的原生事件
 */
export type ChokidarEventType = EventName

/**
 * 文件变化事件数据
 */
export interface FileChangeEvent {
  projectId: string
  event: ChokidarEventType
  filePath: string
  stats?: Stats
  error?: Error
}

/**
 * 项目监控状态
 */
export interface ProjectWatchState {
  projectId: string
  projectPath: string
  isWatching: boolean
  watcher?: FSWatcher
  startedAt?: Date
  lastEventAt?: Date
  eventCount: number
}

/**
 * Chokidar监控配置选项
 */
export interface ChokidarWatchOptions extends ChokidarOptions {
  // 继承Chokidar的所有选项，并添加我们的自定义选项
  projectId: string
  projectPath: string
}

/**
 * ChokidarWatcherService接口定义
 */
export interface IChokidarWatcherService {
  /**
   * 启动项目文件监控
   */
  startWatching(projectId: string, projectPath: string): Promise<void>

  /**
   * 停止项目文件监控
   */
  stopWatching(projectId: string): Promise<void>

  /**
   * 获取项目监控状态
   */
  getWatchState(projectId: string): ProjectWatchState | null

  /**
   * 获取所有监控状态
   */
  getAllWatchStates(): ProjectWatchState[]

  /**
   * 检查项目是否正在监控
   */
  isWatching(projectId: string): boolean
}

/**
 * Chokidar文件监控服务
 * 基于RFC-001 v3的简化架构设计
 */
export class ChokidarWatcherService extends EventEmitter implements IChokidarWatcherService {
  private watchStates = new Map<string, ProjectWatchState>()

  constructor() {
    super()
    console.log('ChokidarWatcherService 初始化完成')
  }

  async startWatching(projectId: string, projectPath: string): Promise<void> {
    try {
      // 检查是否已经在监控
      if (this.isWatching(projectId)) {
        console.log(`项目 ${projectId} 已经在监控中，跳过启动`)
        return
      }

      console.log(`开始启动项目文件监控: ${projectId} -> ${projectPath}`)

      // 验证项目路径是否存在
      const fs = await import('fs/promises')
      try {
        await fs.access(projectPath)
      } catch {
        throw new Error(`项目路径不存在或无法访问: ${projectPath}`)
      }

      // 创建项目特定的监控配置
      const watchOptions = this.createProjectWatchOptions(projectId, projectPath)

      // 创建Chokidar监控实例
      const watcher = chokidar.watch(projectPath, watchOptions)

      // 初始化项目监控状态
      const watchState: ProjectWatchState = {
        projectId,
        projectPath,
        isWatching: false, // 初始为false，ready事件后设为true
        watcher,
        startedAt: new Date(),
        eventCount: 0
      }

      // 保存监控状态
      this.watchStates.set(projectId, watchState)

      // 设置Chokidar事件监听器
      this.setupChokidarEventListeners(watcher, projectId)

      console.log(`项目文件监控启动成功: ${projectId}`)
    } catch (error) {
      console.error(`启动项目文件监控失败: ${projectId}`, error)

      // 清理可能创建的状态
      this.watchStates.delete(projectId)

      throw error
    }
  }

  async stopWatching(projectId: string): Promise<void> {
    try {
      console.log(`开始停止项目文件监控: ${projectId}`)

      // 获取监控状态
      const watchState = this.watchStates.get(projectId)
      if (!watchState) {
        console.log(`项目 ${projectId} 没有在监控中，跳过停止`)
        return
      }

      // 关闭Chokidar监控器
      if (watchState.watcher) {
        await watchState.watcher.close()
        console.log(`Chokidar监控器已关闭: ${projectId}`)
      }

      // 移除监控状态
      this.watchStates.delete(projectId)

      console.log(`项目文件监控停止成功: ${projectId}`)
    } catch (error) {
      console.error(`停止项目文件监控失败: ${projectId}`, error)

      // 即使出错也要清理状态
      this.watchStates.delete(projectId)

      throw error
    }
  }

  getWatchState(projectId: string): ProjectWatchState | null {
    return this.watchStates.get(projectId) || null
  }

  getAllWatchStates(): ProjectWatchState[] {
    return Array.from(this.watchStates.values())
  }

  isWatching(projectId: string): boolean {
    const state = this.watchStates.get(projectId)
    return state?.isWatching || false
  }

  private getDefaultChokidarOptions(): Partial<ChokidarOptions> {
    return {
      // 基础配置
      persistent: true,
      ignoreInitial: false,

      // 忽略规则 - 基于RFC中的建议
      ignored: (path: string, stats?: Stats) => {
        // 忽略常见的不需要监控的目录和文件
        if (path.includes('node_modules')) return true
        if (path.includes('.git')) return true
        if (path.includes('.DS_Store')) return true
        if (path.includes('Thumbs.db')) return true

        // 忽略临时文件
        if (stats?.isFile() && path.endsWith('.tmp')) return true
        if (stats?.isFile() && path.endsWith('.temp')) return true

        // 忽略隐藏文件（以.开头的文件，除了.clarityignore）
        const fileName = path.split('/').pop() || ''
        if (fileName.startsWith('.') && fileName !== '.clarityignore') return true

        return false
      },

      // 等待写入完成配置 - 避免部分写入的事件
      awaitWriteFinish: {
        stabilityThreshold: 2000, // 文件稳定2秒后触发事件
        pollInterval: 100 // 每100ms检查一次
      },

      // 原子写入检测
      atomic: true,

      // 其他性能优化选项
      usePolling: false, // 在大多数情况下不使用轮询
      interval: 100,
      binaryInterval: 300,
      depth: 99, // 监控深度
      followSymlinks: false // 不跟随符号链接，避免循环
    }
  }

  private createProjectWatchOptions(projectId: string, projectPath: string): ChokidarWatchOptions {
    const defaultOptions = this.getDefaultChokidarOptions()

    return {
      ...defaultOptions,
      projectId,
      projectPath
      // 可以在这里添加项目特定的配置覆盖
    }
  }

  private setupChokidarEventListeners(watcher: FSWatcher, projectId: string): void {
    // 文件添加事件
    watcher.on('add', (path: string, stats?: Stats) => {
      this.handleChokidarEvent(projectId, 'add', path, stats)
    })

    // 文件修改事件
    watcher.on('change', (path: string, stats?: Stats) => {
      this.handleChokidarEvent(projectId, 'change', path, stats)
    })

    // 文件删除事件
    watcher.on('unlink', (path: string) => {
      this.handleChokidarEvent(projectId, 'unlink', path)
    })

    // 目录添加事件
    watcher.on('addDir', (path: string, stats?: Stats) => {
      this.handleChokidarEvent(projectId, 'addDir', path, stats)
    })

    // 目录删除事件
    watcher.on('unlinkDir', (path: string) => {
      this.handleChokidarEvent(projectId, 'unlinkDir', path)
    })

    // 初始扫描完成事件
    watcher.on('ready', () => {
      this.handleChokidarEvent(projectId, 'ready', '')

      // 标记为正在监控
      const watchState = this.watchStates.get(projectId)
      if (watchState) {
        watchState.isWatching = true
        console.log(`项目 ${projectId} 初始扫描完成，开始监控文件变化`)
      }
    })

    // 错误事件
    watcher.on('error', (err: unknown) => {
      const error = err instanceof Error ? err : new Error(String(err))
      this.handleChokidarEvent(projectId, 'error', '', undefined, error)
      console.error(`项目 ${projectId} 文件监控出错:`, error)
    })

    console.log(`已设置项目 ${projectId} 的Chokidar事件监听器`)
  }

  private handleChokidarEvent(
    projectId: string,
    event: ChokidarEventType,
    filePath: string,
    stats?: Stats,
    error?: Error
  ): void {
    // 更新项目监控状态
    const state = this.watchStates.get(projectId)
    if (state) {
      state.lastEventAt = new Date()
      state.eventCount++
    }

    // 创建事件数据
    const eventData: FileChangeEvent = {
      projectId,
      event,
      filePath,
      stats,
      error
    }

    // 发出事件供其他服务监听
    this.emit('fileChange', eventData)

    // 调试日志
    console.log(`[ChokidarWatcher] ${projectId}: ${event} - ${filePath}`)
  }

  /**
   * 清理资源
   */
  async destroy(): Promise<void> {
    console.log('正在清理ChokidarWatcherService资源...')

    // 停止所有监控
    const stopPromises = Array.from(this.watchStates.keys()).map((projectId) =>
      this.stopWatching(projectId)
    )

    await Promise.all(stopPromises)

    // 清理事件监听器
    this.removeAllListeners()

    console.log('ChokidarWatcherService资源清理完成')
  }
}

// 导出单例实例
export const chokidarWatcherService = new ChokidarWatcherService()
