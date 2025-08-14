import { tipc } from '@egoist/tipc/main'
import { projectRouter } from './routers/project.router'
import { fileRouter } from './routers/file.router'
import { settingsRouter } from './routers/settings.router'
import { systemRouter } from './routers/system.router'
import { userRouter } from './routers/user.router'
import { logicalDocumentRouter } from './routers/document/logical-document.router'
import { managedFileRouter } from './routers/managed-file.router'
import { intelligentNamingRouter } from './routers/intelligent-naming.router'
import { intelligentPathGeneratorRouter } from './routers/intelligent-path-generator.router'
import { intelligentFileImportRouter } from './routers/intelligent-file-import.router'
import { documentVersionRouter } from './routers/document/document-version.router'
import { projectAssetsRouter } from './routers/project-assets.router'
import { expenseTrackingRouter } from './routers/expense-tracking.router'
import { budgetPoolRouter } from './routers/budget-pool.router'

import { competitionRouter } from './routers/competition.router'
import { fileAccessRouter } from './routers/file-access.router'
import { quickLookRouter } from './routers/quicklook.router'
import { filesystemOperationsRouter } from './routers/filesystem-operations.router'

// 导出事件系统相关工具
export { TipcEventSender, createEventSender, EventSenderManager } from './lib/tipc-event-sender'

// 导出通用事件类型定义
export type CommonRendererHandlers = {
  // 通知事件
  showNotification: (data: {
    title: string
    message: string
    type?: 'info' | 'success' | 'warning' | 'error'
  }) => void

  // 进度更新事件
  updateProgress: (data: { id: string; progress: number; message?: string }) => void

  // 状态同步事件
  syncStatus: (data: {
    service: string
    status: 'connected' | 'disconnected' | 'syncing' | 'error'
    message?: string
  }) => void

  // 数据刷新事件
  refreshData: (data: { type: string; id?: string }) => void
}

const t = tipc.create()

export const router = {
  // 项目相关路由
  ...projectRouter(t),

  // 文件相关路由
  ...fileRouter(t),

  // 设置相关路由
  ...settingsRouter(t),

  // 系统相关路由
  ...systemRouter(t),

  // 用户相关路由
  ...userRouter(t),

  // 逻辑文档相关路由
  ...logicalDocumentRouter(t),

  // 文档版本相关路由
  ...documentVersionRouter(t),

  // 受管文件相关路由
  ...managedFileRouter(t),

  // 智能命名相关路由
  ...intelligentNamingRouter(t),

  // 智能路径生成相关路由
  ...intelligentPathGeneratorRouter(t),

  // 智能文件导入相关路由
  ...intelligentFileImportRouter(t),

  // 项目资产相关路由
  ...projectAssetsRouter(t),

  // 经费追踪相关路由
  ...expenseTrackingRouter(t),

  // 经费池相关路由
  ...budgetPoolRouter(t),

  // 赛事管理相关路由
  ...competitionRouter(t),

  // 文件访问相关路由
  ...fileAccessRouter(t),

  // 文件系统操作相关路由
  ...filesystemOperationsRouter(t),

  // QuickLook 预览相关路由
  ...quickLookRouter(t)
}

export type Router = typeof router
