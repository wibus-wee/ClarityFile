# 赛事中心组件文档

## 概述

赛事中心是ClarityFile项目的核心功能模块，用于管理赛事系列、里程碑和项目参赛情况。

## 组件架构

### 主要页面
- **`/competitions`** - 赛事中心主页面，包含多个视图切换

### 核心组件

#### 1. CompetitionOverview
- **功能**: 赛事中心概览页面
- **特性**: 
  - 统计信息展示（赛事系列、里程碑、项目参与数量）
  - 快速操作按钮
  - 即将到来的里程碑预览
- **文件**: `competition-overview.tsx`

#### 2. CompetitionSeriesList
- **功能**: 赛事系列管理
- **特性**:
  - 网格布局展示赛事系列
  - 搜索、排序、筛选功能
  - 右键菜单操作（编辑、删除、添加里程碑）
- **文件**: `competition-series-list.tsx`

#### 3. CompetitionTimeline
- **功能**: 时间轴视图
- **特性**:
  - 按时间顺序展示所有里程碑
  - 过期、今天、即将到来的状态标识
  - 可展开查看详细信息
- **文件**: `competition-timeline.tsx`

#### 4. UpcomingMilestones
- **功能**: 即将到来的里程碑
- **特性**:
  - 按紧急程度分组显示
  - 颜色编码的紧急程度指示器
  - 倒计时显示
- **文件**: `upcoming-milestones.tsx`

### 对话框和抽屉

#### 1. CreateCompetitionSeriesDialog
- **功能**: 创建赛事系列
- **类型**: Dialog（简单表单）
- **文件**: `dialogs/create-competition-series-dialog.tsx`

#### 2. CreateCompetitionMilestoneDrawer
- **功能**: 创建赛事里程碑
- **类型**: Drawer（复杂表单）
- **文件**: `drawers/create-competition-milestone-drawer.tsx`

## 设计特点

### 🎨 视觉设计
- **避免Card组件**: 使用自定义设计的容器
- **macOS风格**: 采用macOS颜色系统和轻量阴影
- **响应式布局**: 支持多种屏幕尺寸
- **一致性**: 统一的间距、字体和颜色

### ✨ 动画效果
- **framer-motion**: 微妙自然的动画效果
- **布局动画**: 列表项的添加、删除、重排动画
- **悬停效果**: 轻微的Y轴位移和阴影变化
- **页面切换**: 平滑的视图切换动画

### 🔧 交互设计
- **多视图切换**: Tab式导航，支持键盘操作
- **搜索筛选**: 实时搜索和多维度筛选
- **操作反馈**: Toast通知和加载状态
- **错误处理**: 友好的错误提示和验证

## 技术实现

### 🔌 API集成
- **TIPC**: 使用现有的competition.service.ts后端服务
- **SWR**: 数据缓存和自动重新验证
- **类型安全**: 完全使用main/types中的类型定义

### 📊 数据管理
- **实时更新**: SWR自动处理数据同步
- **乐观更新**: 操作后立即更新UI
- **错误恢复**: 失败时自动回滚状态

### 🎯 状态管理
- **本地状态**: useState管理组件内部状态
- **表单状态**: 受控组件模式
- **全局状态**: 通过SWR共享数据状态

## 使用方式

### 基本用法
```tsx
import { CompetitionsPage } from '@renderer/routes/competitions'

// 在路由中使用
<Route path="/competitions" component={CompetitionsPage} />
```

### 组件引用
```tsx
import { CompetitionOverview } from '@renderer/components/competitions/competition-overview'
import { CompetitionSeriesList } from '@renderer/components/competitions/competition-series-list'
```

## 扩展指南

### 添加新视图
1. 在主页面添加新的Tab配置
2. 创建对应的组件文件
3. 在主页面的switch语句中添加渲染逻辑

### 添加新操作
1. 在use-tipc.ts中添加对应的hook
2. 在组件中使用新的hook
3. 添加相应的UI交互元素

### 自定义样式
所有组件都支持通过className自定义样式，遵循Tailwind CSS规范。

## 依赖项

### 核心依赖
- `@tanstack/react-router` - 路由管理
- `swr` - 数据请求和缓存
- `framer-motion` - 动画效果
- `date-fns` - 日期处理
- `lucide-react` - 图标库

### UI组件
- `@renderer/components/ui/*` - shadcn/ui组件库
- 自定义组件遵循相同的设计规范

## 注意事项

1. **类型安全**: 始终使用main/types中的类型定义
2. **性能优化**: 使用React.memo和useMemo优化渲染
3. **可访问性**: 支持键盘导航和屏幕阅读器
4. **错误边界**: 组件级别的错误处理
5. **测试友好**: 组件设计便于单元测试
