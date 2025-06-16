# 404 Not Found 组件使用指南

这个文件包含了多种 404 Not Found 组件，用于处理页面或内容未找到的情况。

## 组件概览

### 1. NotFound (主要 404 组件)
用于显示完整的 404 页面，适合路由级别的未找到处理。

### 2. DefaultNotFound 
TanStack Router 的默认 404 组件，自动使用 NotFound。

### 3. InlineNotFound
轻量级 404 组件，适合在小区域显示未找到状态。

## 使用示例

### 1. TanStack Router 默认 404 组件

```tsx
// __root.tsx
import { DefaultNotFound } from '@renderer/components/not-found'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: DefaultNotFound
})
```

### 2. 自定义 404 页面

```tsx
import { NotFound } from '@renderer/components/not-found'

function CustomNotFoundPage() {
  return (
    <NotFound
      title="页面走丢了"
      description="您访问的页面可能已被删除或移动到其他位置"
      showSearch={true}
      showSuggestions={true}
    />
  )
}
```

### 3. 禁用搜索和建议的简洁版本

```tsx
import { NotFound } from '@renderer/components/not-found'

function SimpleNotFound() {
  return (
    <NotFound
      title="页面未找到"
      description="请检查 URL 是否正确"
      showSearch={false}
      showSuggestions={false}
    />
  )
}
```

### 4. 内联未找到状态

```tsx
import { InlineNotFound } from '@renderer/components/not-found'

function DataList() {
  const { data, loading } = useData()
  
  if (loading) return <div>加载中...</div>
  
  if (!data || data.length === 0) {
    return (
      <InlineNotFound
        title="暂无数据"
        description="没有找到任何内容，请稍后再试"
        action={
          <Button onClick={refetch}>
            刷新
          </Button>
        }
      />
    )
  }
  
  return <div>{/* 渲染数据 */}</div>
}
```

### 5. 搜索结果为空

```tsx
import { InlineNotFound } from '@renderer/components/not-found'

function SearchResults({ query, results }) {
  if (results.length === 0) {
    return (
      <InlineNotFound
        title="未找到搜索结果"
        description={`没有找到与 "${query}" 相关的内容`}
        action={
          <Button variant="outline" onClick={clearSearch}>
            清除搜索
          </Button>
        }
      />
    )
  }
  
  return <div>{/* 渲染搜索结果 */}</div>
}
```

### 6. 文件不存在

```tsx
import { InlineNotFound } from '@renderer/components/not-found'

function FileViewer({ fileId }) {
  const { file, error } = useFile(fileId)
  
  if (error?.status === 404) {
    return (
      <InlineNotFound
        title="文件不存在"
        description="请求的文件可能已被删除或移动"
      />
    )
  }
  
  return <div>{/* 渲染文件内容 */}</div>
}
```

## 组件属性

### NotFound 组件

```tsx
interface NotFoundProps {
  title?: string              // 标题文本
  description?: string        // 描述文本
  showSearch?: boolean        // 是否显示搜索框
  showSuggestions?: boolean   // 是否显示页面建议
  className?: string          // 自定义样式类
}
```

### InlineNotFound 组件

```tsx
interface InlineNotFoundProps {
  title?: string              // 标题文本
  description?: string        // 描述文本
  action?: React.ReactNode    // 自定义操作按钮
}
```

## 设计特点

### 🎨 设计风格
- 符合 macOS 设计语言
- 使用 shadcn/ui 组件库
- 支持深色/浅色主题
- Lucide React 图标

### 📱 响应式设计
- 移动端友好
- 自适应布局
- 合理的间距和字体大小

### 🔧 功能特性
- **搜索功能**: 帮助用户找到想要的内容
- **页面建议**: 推荐相关页面
- **返回导航**: 返回上页或首页
- **自定义操作**: 支持自定义按钮
- **时间戳**: 显示错误发生时间

### 🛡️ 用户体验
- 友好的错误提示
- 清晰的导航选项
- 有用的建议信息
- 一致的视觉风格

## 最佳实践

1. **在路由根部配置默认 404 组件**
2. **为不同场景使用合适的组件**
3. **提供有意义的错误消息**
4. **包含有用的导航选项**
5. **考虑用户的下一步操作**
6. **保持设计一致性**

## 自定义样式

所有组件都支持通过 className 自定义样式：

```tsx
<NotFound
  title="自定义 404"
  className="my-custom-404-style"
/>

<InlineNotFound
  title="自定义内联 404"
  className="my-custom-inline-style"
/>
```

## 搜索功能集成

可以在 NotFound 组件的搜索功能中集成实际的搜索逻辑：

```tsx
// 在 not-found.tsx 中的 handleSearch 函数
const handleSearch = (e: React.FormEvent) => {
  e.preventDefault()
  if (searchQuery.trim()) {
    // 跳转到搜索页面
    router.navigate({ 
      to: '/search', 
      search: { q: searchQuery } 
    })
  }
}
```

## 页面建议自定义

可以根据当前路由或用户角色自定义页面建议：

```tsx
const suggestions = useMemo(() => {
  // 根据用户角色或当前路径返回不同的建议
  if (userRole === 'admin') {
    return adminSuggestions
  }
  return defaultSuggestions
}, [userRole])

return (
  <NotFound
    title="页面未找到"
    showSuggestions={true}
    // 可以通过 props 传入自定义建议
  />
)
```

## 错误追踪

可以在 404 组件中添加错误追踪：

```tsx
useEffect(() => {
  // 记录 404 错误
  analytics.track('404_error', {
    path: window.location.pathname,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  })
}, [])
```
