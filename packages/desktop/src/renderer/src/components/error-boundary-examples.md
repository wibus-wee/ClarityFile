# 错误边界组件使用指南

这个文件包含了多种错误边界组件，用于处理应用程序中的错误情况。

## 组件概览

### 1. ErrorBoundary (主要错误组件)
用于显示完整的错误页面，适合路由级别的错误处理。

### 2. DefaultErrorComponent 
TanStack Router 的默认错误组件，自动使用 ErrorBoundary。

### 3. ReactErrorBoundary (类组件)
React 错误边界类组件，可以包装任何组件来捕获错误。

### 4. InlineErrorBoundary
轻量级错误组件，适合在小区域显示错误信息。

## 使用示例

### 1. TanStack Router 默认错误组件

```tsx
// main.tsx
import { DefaultErrorComponent } from './components/error-boundary'

const router = createRouter({
  routeTree,
  defaultErrorComponent: DefaultErrorComponent
})
```

### 2. 包装组件以捕获错误

```tsx
import { ReactErrorBoundary } from '@renderer/components/error-boundary'

function MyApp() {
  return (
    <ReactErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo)
        // 可以发送错误报告到服务器
      }}
    >
      <MyComponent />
    </ReactErrorBoundary>
  )
}
```

### 3. 自定义错误回退组件

```tsx
import { ReactErrorBoundary } from '@renderer/components/error-boundary'

function MyApp() {
  return (
    <ReactErrorBoundary
      fallback={(error, reset) => (
        <div className="p-4 text-center">
          <h2>自定义错误页面</h2>
          <p>{error.message}</p>
          <button onClick={reset}>重试</button>
        </div>
      )}
    >
      <MyComponent />
    </ReactErrorBoundary>
  )
}
```

### 4. 内联错误显示

```tsx
import { InlineErrorBoundary } from '@renderer/components/error-boundary'

function MyComponent() {
  const [error, setError] = useState<Error | null>(null)
  
  if (error) {
    return (
      <InlineErrorBoundary
        error={error}
        reset={() => setError(null)}
        title="数据加载失败"
        showDetails={true}
      />
    )
  }
  
  return <div>正常内容</div>
}
```

### 5. 在数据获取中使用

```tsx
import { InlineErrorBoundary } from '@renderer/components/error-boundary'

function DataComponent() {
  const { data, error, refetch } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData
  })
  
  if (error) {
    return (
      <InlineErrorBoundary
        error={error}
        reset={() => refetch()}
        title="数据获取失败"
      />
    )
  }
  
  return <div>{data}</div>
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
- **重试功能**: 提供重试按钮
- **返回首页**: 快速导航到安全页面
- **错误详情**: 开发环境下显示详细错误信息
- **可折叠详情**: 避免界面过于复杂
- **帮助信息**: 提供用户友好的解决建议

### 🛡️ 安全性
- 生产环境隐藏敏感错误信息
- 开发环境显示完整堆栈跟踪
- 防止错误信息泄露

## 最佳实践

1. **在应用根部使用 ReactErrorBoundary**
2. **为关键组件单独包装错误边界**
3. **在数据获取组件中使用 InlineErrorBoundary**
4. **记录错误信息用于调试**
5. **提供有意义的错误消息**
6. **测试错误边界的工作情况**

## 自定义样式

所有组件都支持通过 className 自定义样式：

```tsx
<InlineErrorBoundary
  error={error}
  reset={reset}
  className="my-custom-error-style"
/>
```

## 错误报告

可以在 ReactErrorBoundary 的 onError 回调中添加错误报告逻辑：

```tsx
<ReactErrorBoundary
  onError={(error, errorInfo) => {
    // 发送到错误监控服务
    errorReportingService.captureException(error, {
      extra: errorInfo
    })
  }}
>
  <App />
</ReactErrorBoundary>
```
