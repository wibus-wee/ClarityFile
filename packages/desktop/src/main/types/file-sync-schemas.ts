import { z } from 'zod'

/**
 * 文件同步相关的Schema定义
 * 基于RFC-001 v3的Chokidar架构设计
 */

// ===== 基础类型Schema =====

/**
 * Chokidar事件类型Schema
 */
export const chokidarEventSchema = z.enum(
  [
    'add', // 文件添加
    'change', // 文件修改
    'unlink', // 文件删除
    'addDir', // 目录添加
    'unlinkDir', // 目录删除
    'ready', // 初始扫描完成
    'error' // 错误事件
  ],
  {
    errorMap: () => ({ message: 'Chokidar事件类型无效' })
  }
)

/**
 * 同步状态Schema
 */
export const syncStatusSchema = z.enum(
  [
    'synced', // 已同步
    'pending', // 待处理
    'ignored' // 已忽略
  ],
  {
    errorMap: () => ({ message: '同步状态必须是 synced、pending 或 ignored' })
  }
)

/**
 * 变化类型Schema（映射的业务类型）
 */
export const changeTypeSchema = z.enum(
  [
    'file_added', // 文件添加
    'file_modified', // 文件修改
    'file_removed', // 文件删除
    'dir_added', // 目录添加
    'dir_removed' // 目录删除
  ],
  {
    errorMap: () => ({ message: '变化类型无效' })
  }
)

// ===== 输入Schema =====

/**
 * 启动项目监控Schema
 */
export const startProjectWatchingSchema = z.object({
  projectId: z.string().uuid('项目ID必须是有效的UUID'),
  projectPath: z.string().min(1, '项目路径不能为空')
})

/**
 * 停止项目监控Schema
 */
export const stopProjectWatchingSchema = z.object({
  projectId: z.string().uuid('项目ID必须是有效的UUID')
})

/**
 * 获取项目监控状态Schema
 */
export const getProjectWatchStateSchema = z.object({
  projectId: z.string().uuid('项目ID必须是有效的UUID')
})

/**
 * 确认文件变化Schema
 */
export const confirmFileChangeSchema = z.object({
  changeLogId: z.string().uuid('变化日志ID必须是有效的UUID'),
  confirmed: z.boolean()
})

/**
 * 批量确认文件变化Schema
 */
export const batchConfirmFileChangesSchema = z.object({
  changeLogIds: z.array(z.string().uuid()).min(1, '至少需要一个变化日志ID'),
  confirmed: z.boolean()
})

// ===== 输出类型定义 =====

/**
 * 项目监控状态输出
 */
export interface ProjectWatchStateOutput {
  projectId: string
  projectPath: string
  isWatching: boolean
  startedAt?: string // ISO字符串
  lastEventAt?: string // ISO字符串
  eventCount: number
}

/**
 * 文件变化事件输出
 */
export interface FileChangeEventOutput {
  projectId: string
  event: z.infer<typeof chokidarEventSchema>
  filePath: string
  fileSize?: number
  lastModified?: string // ISO字符串
  error?: string
}

/**
 * 同步状态输出
 */
export interface SyncStateOutput {
  id: string
  projectId: string
  filePath: string
  lastSyncTimestamp?: string // ISO字符串
  syncStatus: z.infer<typeof syncStatusSchema>
  fileSize?: number
  lastModified?: string // ISO字符串
  createdAt: string // ISO字符串
  updatedAt: string // ISO字符串
}

/**
 * 变化日志输出
 */
export interface ChangeLogOutput {
  id: string
  projectId: string
  changeType: z.infer<typeof changeTypeSchema>
  filePath: string
  fileSize?: number
  userConfirmed: boolean
  appliedAt?: string // ISO字符串
  chokidarEvent: z.infer<typeof chokidarEventSchema>
  metadata?: Record<string, any>
  createdAt: string // ISO字符串
}

/**
 * 项目文件同步概览输出
 */
export interface ProjectSyncOverviewOutput {
  projectId: string
  watchState: ProjectWatchStateOutput
  syncStates: SyncStateOutput[]
  pendingChanges: ChangeLogOutput[]
  statistics: {
    totalFiles: number
    syncedFiles: number
    pendingFiles: number
    ignoredFiles: number
    recentChanges: number // 最近24小时的变化数量
  }
}

// ===== 验证函数 =====

/**
 * 验证启动项目监控输入
 */
export function validateStartProjectWatching(input: unknown) {
  return startProjectWatchingSchema.parse(input)
}

/**
 * 验证停止项目监控输入
 */
export function validateStopProjectWatching(input: unknown) {
  return stopProjectWatchingSchema.parse(input)
}

/**
 * 验证获取项目监控状态输入
 */
export function validateGetProjectWatchState(input: unknown) {
  return getProjectWatchStateSchema.parse(input)
}

/**
 * 验证确认文件变化输入
 */
export function validateConfirmFileChange(input: unknown) {
  return confirmFileChangeSchema.parse(input)
}

/**
 * 验证批量确认文件变化输入
 */
export function validateBatchConfirmFileChanges(input: unknown) {
  return batchConfirmFileChangesSchema.parse(input)
}

// ===== 类型导出 =====

export type ChokidarEventType = z.infer<typeof chokidarEventSchema>
export type SyncStatusType = z.infer<typeof syncStatusSchema>
export type ChangeTypeType = z.infer<typeof changeTypeSchema>

export type StartProjectWatchingInput = z.infer<typeof startProjectWatchingSchema>
export type StopProjectWatchingInput = z.infer<typeof stopProjectWatchingSchema>
export type GetProjectWatchStateInput = z.infer<typeof getProjectWatchStateSchema>
export type ConfirmFileChangeInput = z.infer<typeof confirmFileChangeSchema>
export type BatchConfirmFileChangesInput = z.infer<typeof batchConfirmFileChangesSchema>
