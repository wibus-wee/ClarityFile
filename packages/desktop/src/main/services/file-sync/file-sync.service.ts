import { chokidarWatcherService } from './chokidar-watcher.service'

import {
  StartProjectWatchingInput,
  validateStartProjectWatching,
  StopProjectWatchingInput,
  validateStopProjectWatching,
  GetProjectWatchStateInput,
  ProjectWatchStateOutput,
  validateGetProjectWatchState
} from '../../types/file-sync-schemas'
import { SuccessResponse } from '../../types/outputs'

/**
 * 文件同步服务
 * 提供高级的文件同步管理功能，基于ChokidarWatcherService
 */
export class FileSyncService {
  /**
   * 启动项目文件监控
   */
  static async startProjectWatching(input: StartProjectWatchingInput): Promise<SuccessResponse> {
    try {
      const validatedInput = validateStartProjectWatching(input)

      await chokidarWatcherService.startWatching(
        validatedInput.projectId,
        validatedInput.projectPath
      )

      return { success: true }
    } catch (error) {
      console.error('启动项目文件监控失败:', error)
      throw error
    }
  }

  /**
   * 停止项目文件监控
   */
  static async stopProjectWatching(input: StopProjectWatchingInput): Promise<SuccessResponse> {
    try {
      const validatedInput = validateStopProjectWatching(input)

      await chokidarWatcherService.stopWatching(validatedInput.projectId)

      return { success: true }
    } catch (error) {
      console.error('停止项目文件监控失败:', error)
      throw error
    }
  }

  /**
   * 获取项目监控状态
   */
  static async getProjectWatchState(
    input: GetProjectWatchStateInput
  ): Promise<ProjectWatchStateOutput | null> {
    try {
      const validatedInput = validateGetProjectWatchState(input)

      const watchState = chokidarWatcherService.getWatchState(validatedInput.projectId)

      if (!watchState) {
        return null
      }

      // 转换为输出格式
      return {
        projectId: watchState.projectId,
        projectPath: watchState.projectPath,
        isWatching: watchState.isWatching,
        startedAt: watchState.startedAt?.toISOString(),
        lastEventAt: watchState.lastEventAt?.toISOString(),
        eventCount: watchState.eventCount
      }
    } catch (error) {
      console.error('获取项目监控状态失败:', error)
      throw error
    }
  }

  /**
   * 获取所有项目监控状态
   */
  static async getAllProjectWatchStates(): Promise<ProjectWatchStateOutput[]> {
    try {
      const watchStates = chokidarWatcherService.getAllWatchStates()

      return watchStates.map((state) => ({
        projectId: state.projectId,
        projectPath: state.projectPath,
        isWatching: state.isWatching,
        startedAt: state.startedAt?.toISOString(),
        lastEventAt: state.lastEventAt?.toISOString(),
        eventCount: state.eventCount
      }))
    } catch (error) {
      console.error('获取所有项目监控状态失败:', error)
      throw error
    }
  }

  /**
   * 检查项目是否正在监控
   */
  static async isProjectWatching(
    input: GetProjectWatchStateInput
  ): Promise<{ isWatching: boolean }> {
    try {
      const validatedInput = validateGetProjectWatchState(input)

      const isWatching = chokidarWatcherService.isWatching(validatedInput.projectId)

      return { isWatching }
    } catch (error) {
      console.error('检查项目监控状态失败:', error)
      throw error
    }
  }

  /**
   * 启动所有项目的文件监控
   * 这个方法将在第三步实现
   */
  static async startAllProjectWatching(): Promise<SuccessResponse> {
    // 实现将在第三步添加
    throw new Error('Method not implemented yet')
  }

  /**
   * 停止所有项目的文件监控
   */
  static async stopAllProjectWatching(): Promise<SuccessResponse> {
    try {
      const watchStates = chokidarWatcherService.getAllWatchStates()

      // 并行停止所有监控
      const stopPromises = watchStates.map((state) =>
        chokidarWatcherService.stopWatching(state.projectId)
      )

      await Promise.all(stopPromises)

      return { success: true }
    } catch (error) {
      console.error('停止所有项目文件监控失败:', error)
      throw error
    }
  }

  /**
   * 设置文件变化事件监听器
   * 用于监听ChokidarWatcherService发出的文件变化事件
   */
  static setupFileChangeListener(callback: (event: any) => void): () => void {
    chokidarWatcherService.on('fileChange', callback)

    // 返回取消监听的函数
    return () => {
      chokidarWatcherService.off('fileChange', callback)
    }
  }
}
