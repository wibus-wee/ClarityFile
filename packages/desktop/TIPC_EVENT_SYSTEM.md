# TIPC 事件系统文档

## 概述

ClarityFile 项目的 TIPC 事件系统提供了类型安全的实时通信机制，支持主进程向渲染进程发送事件，以及双向的事件调用。该系统基于 `@egoist/tipc` 构建，遵循项目偏好的事件推送模式而非轮询。

## 架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   主进程         │    │   Preload       │    │   渲染进程        │
│                 │    │                 │    │                 │
│  EventSender    │───►│  ipcOn/ipcSend  │───►│  EventHandlers  │
│  Services       │    │                 │    │  React Hooks    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 核心组件

### 主进程 (Main Process)

#### 1. TipcEventSender 类

通用的事件发送器，支持类型安全的事件发送。

```typescript
import { TipcEventSender, createEventSender } from './lib/tipc-event-sender'

// 定义事件类型
type MyEventHandlers = {
  showNotification: (data: { title: string; message: string }) => void
  updateProgress: (data: { id: string; progress: number }) => void
}

// 创建事件发送器
const eventSender = createEventSender<MyEventHandlers>()

// 初始化（在主窗口创建后）
eventSender.initialize(mainWindow)

// 发送事件
eventSender.send('showNotification', { title: '标题', message: '消息' })
```

#### 2. EventSenderManager 类

管理多个事件发送器实例的单例管理器。

```typescript
import { EventSenderManager } from './lib/tipc-event-sender'

const manager = EventSenderManager.getInstance()

// 注册事件发送器
manager.register('notification', notificationSender)
manager.register('fileOperation', fileOperationSender)

// 批量初始化
manager.initializeAll(mainWindow)
```

### 渲染进程 (Renderer Process)

#### 1. 事件监听器创建

```typescript
import { createTipcEventHandlers } from '../lib/tipc-events'

const handlers = createTipcEventHandlers<MyEventHandlers>()
```

#### 2. React Hooks

**useTipcEvent** - 监听事件

```typescript
import { useCallback } from 'react'
import { useTipcEvent } from '../lib/tipc-events'

// 使用 useCallback 优化回调函数
const handleNotification = useCallback((data) => {
  toast.success(data.title, { description: data.message })
}, [])

useTipcEvent(handlers, 'showNotification', handleNotification)
```

**useTipcEventHandler** - 处理双向调用

```typescript
import { useCallback } from 'react'
import { useTipcEventHandler } from '../lib/tipc-events'

// 使用 useCallback 优化处理函数
const handleCalculation = useCallback((a, b) => {
  return a + b
}, [])

useTipcEventHandler(handlers, 'calculateInRenderer', handleCalculation)
```

## 使用指南

### 1. 在服务中使用事件发送器

```typescript
// services/notification.service.ts
import { TipcEventSender, createEventSender } from '../tipc'
import type { CommonRendererHandlers } from '../tipc'

export class NotificationService {
  private eventSender: TipcEventSender<CommonRendererHandlers>

  constructor() {
    this.eventSender = createEventSender<CommonRendererHandlers>()
  }

  initialize(mainWindow: BrowserWindow): void {
    this.eventSender.initialize(mainWindow)
  }

  sendNotification(title: string, message: string): void {
    this.eventSender.send('showNotification', { title, message, type: 'info' })
  }
}
```

### 2. 在前端组件中监听事件

```typescript
// components/NotificationListener.tsx
import React, { useCallback } from 'react'
import { toast } from 'sonner'
import { createTipcEventHandlers, useTipcEvent } from '../lib/tipc-events'
import type { CommonRendererHandlers } from '@main/tipc'

export function NotificationListener() {
  const handlers = createTipcEventHandlers<CommonRendererHandlers>()

  // 使用 useCallback 优化回调函数
  const handleNotification = useCallback(
    (data: { title: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }) => {
      const { title, message, type = 'info' } = data

      switch (type) {
        case 'success':
          toast.success(title, { description: message })
          break
        case 'error':
          toast.error(title, { description: message })
          break
        default:
          toast.info(title, { description: message })
      }
    },
    []
  )

  useTipcEvent(handlers, 'showNotification', handleNotification)

  return null
}
```

### 3. 与 SWR 集成

```typescript
import { useCallback } from 'react'
import { mutate } from 'swr'

// 使用 useCallback 优化数据刷新处理
const handleDataRefresh = useCallback((data: { type: string; id?: string }) => {
  const { type, id } = data

  switch (type) {
    case 'projects':
      mutate('projects')
      if (id) mutate(['project', id])
      break
    case 'documents':
      mutate('all-documents')
      break
  }
}, [])

// 监听数据刷新事件
useTipcEvent(handlers, 'refreshData', handleDataRefresh)
```

## 预定义事件类型

### CommonRendererHandlers

```typescript
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
```

## 最佳实践

### 1. 事件类型定义

- 为每个服务定义专门的事件类型
- 使用描述性的事件名称
- 确保事件数据结构清晰

### 2. React Hook 使用

- 始终使用 `useCallback` 包装事件处理函数
- 确保所有依赖都在依赖数组中
- 在组件顶层调用所有 Hook

### 3. 错误处理

- 在事件发送器中添加 try-catch
- 记录事件发送失败的日志
- 提供降级处理方案

### 4. 性能优化

- 避免频繁发送大量事件
- 使用防抖处理高频事件
- 及时清理事件监听器
- 使用 useCallback 防止不必要的重新订阅

### 5. 类型安全

- 始终使用 TypeScript 类型定义
- 利用泛型确保类型安全
- 避免使用 any 类型

## 示例项目集成

### 主进程初始化

```typescript
// main/index.ts
import { initializeEventSenders } from './examples/event-system-usage'

app.whenReady().then(() => {
  const mainWindow = createWindow()

  // 初始化所有事件发送器
  initializeEventSenders(mainWindow)
})
```

### 前端根组件

```typescript
// renderer/App.tsx
import { GlobalEventListeners } from './examples/event-system-usage'

export function App() {
  return (
    <div>
      {/* 应用内容 */}
      <GlobalEventListeners />
    </div>
  )
}
```

## 扩展指南

### 添加新的事件类型

1. 定义事件处理器类型
2. 创建对应的事件发送器
3. 在前端创建事件监听器
4. 更新文档和示例

### 集成现有服务

1. 在服务中添加事件发送器
2. 在适当的时机发送事件
3. 在前端添加对应的监听器
4. 测试事件流程

## 注意事项

1. **初始化顺序**：确保在主窗口创建后再初始化事件发送器
2. **内存泄漏**：及时清理事件监听器，特别是在组件卸载时
3. **事件命名**：使用一致的命名规范，避免事件名称冲突
4. **调试**：利用控制台日志跟踪事件发送和接收
5. **测试**：为事件系统编写单元测试和集成测试

## 完整示例代码

### 主进程示例

#### 基础服务示例

```typescript
// services/notification.service.ts
import { BrowserWindow } from 'electron'
import { TipcEventSender, createEventSender, CommonRendererHandlers } from '../tipc'

export class NotificationService {
  private eventSender: TipcEventSender<CommonRendererHandlers>

  constructor() {
    this.eventSender = createEventSender<CommonRendererHandlers>()
  }

  initialize(mainWindow: BrowserWindow) {
    this.eventSender.initialize(mainWindow)
  }

  sendNotification(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) {
    this.eventSender.send('showNotification', { title, message, type })
  }

  updateProgress(id: string, progress: number, message?: string) {
    this.eventSender.send('updateProgress', { id, progress, message })
  }

  updateSyncStatus(
    service: string,
    status: 'connected' | 'disconnected' | 'syncing' | 'error',
    message?: string
  ) {
    this.eventSender.send('syncStatus', { service, status, message })
  }

  refreshData(type: string, id?: string) {
    this.eventSender.send('refreshData', { type, id })
  }
}
```

#### 自定义事件类型示例

```typescript
// services/file-operation.service.ts
export type FileOperationHandlers = {
  fileUploaded: (data: { fileId: string; fileName: string; projectId?: string }) => void
  fileDeleted: (data: { fileId: string; fileName: string }) => void
  fileRenamed: (data: { fileId: string; oldName: string; newName: string }) => void
}

export class FileOperationService {
  private eventSender: TipcEventSender<FileOperationHandlers>

  constructor() {
    this.eventSender = createEventSender<FileOperationHandlers>()
  }

  initialize(mainWindow: BrowserWindow) {
    this.eventSender.initialize(mainWindow)
  }

  notifyFileUploaded(fileId: string, fileName: string, projectId?: string) {
    this.eventSender.send('fileUploaded', { fileId, fileName, projectId })
  }

  notifyFileDeleted(fileId: string, fileName: string) {
    this.eventSender.send('fileDeleted', { fileId, fileName })
  }

  notifyFileRenamed(fileId: string, oldName: string, newName: string) {
    this.eventSender.send('fileRenamed', { fileId, oldName, newName })
  }
}
```

#### 使用事件管理器

```typescript
// services/service-manager.ts
import { EventSenderManager } from '../lib/tipc-event-sender'

export class ServiceManager {
  private notificationService: NotificationService
  private fileOperationService: FileOperationService

  constructor() {
    this.notificationService = new NotificationService()
    this.fileOperationService = new FileOperationService()

    // 注册到全局管理器
    const manager = EventSenderManager.getInstance()
    manager.register('notification', this.notificationService['eventSender'])
    manager.register('fileOperation', this.fileOperationService['eventSender'])
  }

  initialize(mainWindow: BrowserWindow) {
    // 使用管理器批量初始化
    EventSenderManager.getInstance().initializeAll(mainWindow)
  }

  getNotificationService() {
    return this.notificationService
  }

  getFileOperationService() {
    return this.fileOperationService
  }
}
```

#### 在现有服务中集成

```typescript
// services/project.service.ts
export class ProjectService {
  private eventSender: TipcEventSender<CommonRendererHandlers>

  constructor() {
    this.eventSender = createEventSender<CommonRendererHandlers>()
  }

  initialize(mainWindow: BrowserWindow) {
    this.eventSender.initialize(mainWindow)
  }

  async createProject(projectData: any) {
    try {
      // 发送进度更新
      this.eventSender.send('updateProgress', {
        id: 'create-project',
        progress: 0,
        message: '开始创建项目...'
      })

      // 模拟项目创建过程
      await this.simulateProjectCreation()

      // 发送成功通知
      this.eventSender.send('showNotification', {
        title: '项目创建成功',
        message: `项目 "${projectData.name}" 已成功创建`,
        type: 'success'
      })

      // 触发数据刷新
      this.eventSender.send('refreshData', { type: 'projects' })

      return { success: true, projectId: 'new-project-id' }
    } catch (error) {
      // 发送错误通知
      this.eventSender.send('showNotification', {
        title: '项目创建失败',
        message: error instanceof Error ? error.message : '未知错误',
        type: 'error'
      })
      throw error
    }
  }

  private async simulateProjectCreation() {
    const stages = [
      { progress: 25, message: '创建项目目录...' },
      { progress: 50, message: '初始化数据库记录...' },
      { progress: 75, message: '设置项目配置...' },
      { progress: 100, message: '项目创建完成' }
    ]

    for (const stage of stages) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.eventSender.send('updateProgress', {
        id: 'create-project',
        progress: stage.progress,
        message: stage.message
      })
    }
  }
}
```

### 前端示例

#### 基础事件监听（遵循React最佳实践）

```tsx
// components/NotificationListener.tsx
import React, { useCallback } from 'react'
import { toast } from 'sonner'
import { createTipcEventHandlers, useTipcEvent } from '../lib/tipc-events'
import type { CommonRendererHandlers } from '@main/tipc'

export function NotificationListener() {
  const handlers = createTipcEventHandlers<CommonRendererHandlers>()

  // ✅ 使用 useCallback 优化回调函数
  const handleNotification = useCallback(
    (data: { title: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }) => {
      const { title, message, type = 'info' } = data

      switch (type) {
        case 'success':
          toast.success(title, { description: message })
          break
        case 'error':
          toast.error(title, { description: message })
          break
        case 'warning':
          toast.warning(title, { description: message })
          break
        default:
          toast.info(title, { description: message })
      }
    },
    []
  )

  // ✅ useTipcEvent 内部已经正确处理了依赖数组和 useCallback
  useTipcEvent(handlers, 'showNotification', handleNotification)

  return null
}
```

#### 进度监听组件

```tsx
// components/ProgressListener.tsx
export function ProgressListener() {
  const [progresses, setProgresses] = useState<
    Record<string, { progress: number; message?: string }>
  >({})
  const handlers = createTipcEventHandlers<CommonRendererHandlers>()

  useTipcEvent(handlers, 'updateProgress', (data) => {
    const { id, progress, message } = data
    setProgresses((prev) => ({
      ...prev,
      [id]: { progress, message }
    }))

    // 如果进度完成，3秒后清除
    if (progress >= 100) {
      setTimeout(() => {
        setProgresses((prev) => {
          const newProgresses = { ...prev }
          delete newProgresses[id]
          return newProgresses
        })
      }, 3000)
    }
  })

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {Object.entries(progresses).map(([id, { progress, message }]) => (
        <div key={id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{message || '处理中...'}</span>
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```

#### 状态同步监听

```tsx
// components/SyncStatusListener.tsx
import { useState, useCallback } from 'react'

export function SyncStatusListener() {
  const [syncStatuses, setSyncStatuses] = useState<
    Record<string, { status: string; message?: string }>
  >({})
  const handlers = createTipcEventHandlers<CommonRendererHandlers>()

  // 使用 useCallback 优化状态更新函数
  const handleSyncStatus = useCallback(
    (data: { service: string; status: string; message?: string }) => {
      const { service, status, message } = data
      setSyncStatuses((prev) => ({
        ...prev,
        [service]: { status, message }
      }))
    },
    []
  )

  useTipcEvent(handlers, 'syncStatus', handleSyncStatus)

  return (
    <div className="fixed bottom-4 right-4 space-y-1 z-40">
      {Object.entries(syncStatuses).map(([service, { status, message }]) => (
        <div
          key={service}
          className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm border text-xs"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'connected'
                ? 'bg-green-500'
                : status === 'syncing'
                  ? 'bg-yellow-500 animate-pulse'
                  : status === 'error'
                    ? 'bg-red-500'
                    : 'bg-gray-400'
            }`}
          />
          <span className="font-medium">{service}</span>
          <span className="text-gray-500">{status}</span>
          {message && <span className="text-gray-400">- {message}</span>}
        </div>
      ))}
    </div>
  )
}
```

#### 数据刷新监听（与 SWR 集成）

```tsx
// components/DataRefreshListener.tsx
import { useCallback } from 'react'
import { mutate } from 'swr'

export function DataRefreshListener() {
  const handlers = createTipcEventHandlers<CommonRendererHandlers>()

  // 使用 useCallback 优化数据刷新处理
  const handleDataRefresh = useCallback((data: { type: string; id?: string }) => {
    const { type, id } = data

    // 根据数据类型刷新对应的缓存
    switch (type) {
      case 'projects':
        mutate('projects') // 刷新项目列表
        if (id) {
          mutate(['project', id]) // 刷新特定项目
          mutate(['project-details', id]) // 刷新项目详情
        }
        break
      case 'documents':
        mutate('all-documents')
        if (id) {
          mutate(['project-documents', id])
        }
        break
      case 'files':
        mutate((key) => Array.isArray(key) && key[0] === 'managed-files')
        mutate((key) => Array.isArray(key) && key[0] === 'global-files')
        break
      default:
        console.log(`未知的数据刷新类型: ${type}`)
    }
  }, [])

  useTipcEvent(handlers, 'refreshData', handleDataRefresh)

  return null
}
```

#### 自定义事件监听

```tsx
// components/FileOperationListener.tsx
import { useCallback } from 'react'
import { toast } from 'sonner'

type FileOperationHandlers = {
  fileUploaded: (data: { fileId: string; fileName: string; projectId?: string }) => void
  fileDeleted: (data: { fileId: string; fileName: string }) => void
  fileRenamed: (data: { fileId: string; oldName: string; newName: string }) => void
}

export function FileOperationListener() {
  const handlers = createTipcEventHandlers<FileOperationHandlers>()

  // 使用 useCallback 优化事件处理函数
  const handleFileUploaded = useCallback(
    (data: { fileId: string; fileName: string; projectId?: string }) => {
      toast.success('文件上传成功', {
        description: `文件 "${data.fileName}" 已成功上传`
      })
    },
    []
  )

  const handleFileDeleted = useCallback((data: { fileId: string; fileName: string }) => {
    toast.info('文件已删除', {
      description: `文件 "${data.fileName}" 已被删除`
    })
  }, [])

  const handleFileRenamed = useCallback(
    (data: { fileId: string; oldName: string; newName: string }) => {
      toast.info('文件已重命名', {
        description: `文件 "${data.oldName}" 已重命名为 "${data.newName}"`
      })
    },
    []
  )

  useTipcEvent(handlers, 'fileUploaded', handleFileUploaded)
  useTipcEvent(handlers, 'fileDeleted', handleFileDeleted)
  useTipcEvent(handlers, 'fileRenamed', handleFileRenamed)

  return null
}
```

#### 双向通信示例

```tsx
// components/EventHandlerExample.tsx
import { useCallback } from 'react'

export function EventHandlerExample() {
  const handlers = createTipcEventHandlers<{
    calculateInRenderer: (left: number, right: number) => number
    getUserConfirmation: (message: string) => boolean
  }>()

  // 使用 useCallback 优化处理函数
  const handleCalculation = useCallback((left: number, right: number) => {
    return left + right
  }, [])

  const handleUserConfirmation = useCallback((message: string) => {
    return window.confirm(message)
  }, [])

  // 处理来自主进程的计算请求
  useTipcEventHandler(handlers, 'calculateInRenderer', handleCalculation)

  // 处理用户确认请求
  useTipcEventHandler(handlers, 'getUserConfirmation', handleUserConfirmation)

  return null
}
```

#### 全局事件监听器

```tsx
// components/GlobalEventListeners.tsx
export function GlobalEventListeners() {
  return (
    <>
      <NotificationListener />
      <ProgressListener />
      <SyncStatusListener />
      <DataRefreshListener />
      <FileOperationListener />
      <EventHandlerExample />
    </>
  )
}
```

#### 在组件中使用事件

```tsx
// components/ProjectManagementComponent.tsx
import { useState, useCallback } from 'react'

export function ProjectManagementComponent() {
  const [isCreating, setIsCreating] = useState(false)
  const handlers = createTipcEventHandlers<CommonRendererHandlers>()

  // 使用 useCallback 优化进度更新处理
  const handleProgressUpdate = useCallback(
    (data: { id: string; progress: number; message?: string }) => {
      if (data.id === 'create-project') {
        setIsCreating(data.progress < 100)
      }
    },
    []
  )

  // 监听项目相关的进度更新
  useTipcEvent(handlers, 'updateProgress', handleProgressUpdate)

  const handleCreateProject = useCallback(async () => {
    setIsCreating(true)
    try {
      // 调用主进程的项目创建方法
      // await tipcClient.createProject({ name: 'New Project' })
    } catch (error) {
      setIsCreating(false)
    }
  }, [])

  return (
    <div className="p-4">
      <button
        onClick={handleCreateProject}
        disabled={isCreating}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isCreating ? '创建中...' : '创建项目'}
      </button>
    </div>
  )
}
```

#### 在应用根组件中使用

```tsx
// App.tsx
export function AppWithEventListeners() {
  return (
    <div>
      {/* 其他应用内容 */}
      <GlobalEventListeners />
    </div>
  )
}
```

## 相关文件

- `packages/desktop/src/main/lib/tipc-event-sender.ts` - 主进程事件发送器
- `packages/desktop/src/renderer/src/lib/tipc-events.ts` - 前端事件监听器
- `packages/desktop/src/preload/index.ts` - Preload 脚本增强
