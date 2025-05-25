# TIPC + SWR 集成文档

## 概述

本项目成功集成了 `@egoist/tipc` 和 `SWR`，实现了类型安全的 Electron IPC 通信和高效的数据获取。

## 集成架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   渲染进程       │    │   Preload       │    │   主进程         │
│                │    │                │    │                │
│  SWR Hooks     │◄──►│  ipcInvoke     │◄──►│  TIPC Router   │
│  TIPC Client   │    │                │    │  Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 文件结构

### 主进程 (Main Process)
- `src/main/tipc.ts` - TIPC 路由器定义
- `src/main/index.ts` - 注册 TIPC 路由器

### Preload 脚本
- `src/preload/index.ts` - 暴露 `ipcInvoke` 方法
- `src/preload/index.d.ts` - 类型定义

### 渲染进程 (Renderer Process)
- `src/renderer/src/lib/tipc-client.ts` - TIPC 客户端
- `src/renderer/src/hooks/use-tipc.ts` - SWR 集成的 hooks
- `src/renderer/src/providers/swr-provider.tsx` - SWR 配置提供者

## 主要功能

### 1. 项目管理 API
- `getProjects()` - 获取所有项目
- `getProject(id)` - 获取单个项目
- `createProject(data)` - 创建项目
- `updateProject(data)` - 更新项目
- `deleteProject(id)` - 删除项目
- `searchProjects(query)` - 搜索项目

### 2. 文档管理 API
- `getProjectDocuments(projectId)` - 获取项目文档
- `createLogicalDocument(data)` - 创建逻辑文档

### 3. 标签管理 API
- `getTags()` - 获取所有标签
- `createTag(data)` - 创建标签

### 4. 文件管理 API
- `getManagedFiles(options)` - 获取管理的文件
- `createManagedFile(data)` - 创建文件记录

### 5. 系统信息 API
- `getSystemInfo()` - 获取系统统计信息

## 使用示例

### 基本用法

```typescript
import { useProjects, useCreateProject } from '@renderer/hooks/use-tipc'

function ProjectList() {
  // 获取项目列表
  const { data: projects, error, isLoading } = useProjects()
  
  // 创建项目
  const { trigger: createProject, isMutating } = useCreateProject()
  
  const handleCreate = async () => {
    await createProject({
      name: '新项目',
      description: '项目描述'
    })
  }
  
  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败</div>
  
  return (
    <div>
      {projects?.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
      <button onClick={handleCreate} disabled={isMutating}>
        创建项目
      </button>
    </div>
  )
}
```

### 高级用法

```typescript
// 带参数的查询
const { data: project } = useProject(projectId)

// 搜索功能
const { trigger: search, data: results } = useSearchProjects()
await search({ query: '搜索关键词' })

// 自动重新验证
const { data: systemInfo } = useSystemInfo() // 每30秒自动刷新
```

## SWR 配置

全局 SWR 配置位于 `src/renderer/src/providers/swr-provider.tsx`：

- 禁用窗口焦点时重新验证
- 启用网络重连时重新验证
- 2秒去重间隔
- 错误重试3次，间隔5秒
- 全局错误和成功处理

## 类型安全

- 主进程和渲染进程之间完全类型安全
- 自动推断返回类型
- TypeScript 编译时检查

## 性能优化

1. **SWR 缓存** - 自动缓存和重用数据
2. **请求去重** - 相同请求自动去重
3. **乐观更新** - 立即更新 UI，后台同步
4. **自动重试** - 网络错误自动重试
5. **后台更新** - 数据过期时后台更新

## 错误处理

- 全局错误处理和日志记录
- 用户友好的错误提示
- 自动重试机制
- 网络状态感知

## 测试页面

- `/` - 首页演示组件
- `/projects` - 完整的项目管理页面

## 扩展指南

### 添加新的 API

1. 在 `src/main/tipc.ts` 中添加新的 procedure
2. 在 `src/renderer/src/hooks/use-tipc.ts` 中添加对应的 hook
3. 在组件中使用新的 hook

### 自定义 SWR 配置

可以在 `SWRProvider` 中修改全局配置，或在单个 hook 中传入自定义选项。

## 依赖版本

- `@egoist/tipc`: ^0.3.2
- `swr`: ^2.2.5

## 注意事项

1. 确保 preload 脚本正确暴露 `ipcInvoke` 方法
2. 主进程中必须注册 TIPC 路由器
3. 类型定义需要在渲染进程中正确导入
4. SWR 提供者需要包装在应用根组件中
