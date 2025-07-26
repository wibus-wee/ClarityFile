import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  pluginId?: string
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

/**
 * 插件错误边界组件
 *
 * 功能：
 * - 捕获插件渲染过程中的错误
 * - 提供优雅的错误回退UI
 * - 允许用户重试加载插件
 * - 记录错误信息用于调试
 */
export class PluginErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('Plugin Error Boundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })

    // 这里可以将错误信息发送到错误报告服务
    // reportErrorToService(error, errorInfo, this.props.pluginId)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义的 fallback UI，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认的错误 UI
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
          <h3 className="text-sm font-medium text-foreground mb-2">插件加载失败</h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-sm">
            {this.props.pluginId ? `插件 "${this.props.pluginId}" ` : '插件'}
            遇到了错误，无法正常显示。
          </p>

          {/* 开发环境下显示详细错误信息 */}
          {import.meta.env.DEV && this.state.error && (
            <details className="mb-4 text-left">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                查看错误详情
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded text-muted-foreground overflow-auto max-w-sm max-h-32">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 插件错误边界的 Hook 版本
 * 用于函数组件中包装插件内容
 */
export function withPluginErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  pluginId?: string,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <PluginErrorBoundary pluginId={pluginId} fallback={fallback}>
        <Component {...props} />
      </PluginErrorBoundary>
    )
  }
}

/**
 * 简化的插件错误边界组件
 * 用于包装单个插件的渲染内容
 */
export function PluginWrapper({
  children,
  pluginId,
  className
}: {
  children: ReactNode
  pluginId: string
  className?: string
}) {
  return (
    <div className={className}>
      <PluginErrorBoundary pluginId={pluginId}>{children}</PluginErrorBoundary>
    </div>
  )
}
