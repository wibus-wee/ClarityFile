'use client'

import { Component, ReactNode, ErrorInfo, useState } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Alert, AlertDescription } from '@renderer/components/ui/alert'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@renderer/components/ui/collapsible'

interface ErrorBoundaryProps {
  error: Error
  reset?: () => void
  info?: {
    componentStack?: string | null
  }
}

export function ErrorBoundary({ error, reset, info }: ErrorBoundaryProps) {
  const [showDetails, setShowDetails] = useState(false)

  const isDevelopment = import.meta.env.DEV

  return (
    <div className="flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-semibold">出现了一些问题</CardTitle>
          <CardDescription className="text-base">
            应用程序遇到了意外错误，我们正在努力解决这个问题。
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 错误信息 */}
          <Alert variant="destructive">
            <Bug className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {error.message || '未知错误'}
            </AlertDescription>
          </Alert>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {reset && (
              <Button onClick={reset} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                重试
              </Button>
            )}

            <Button variant="outline" asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                返回首页
              </Link>
            </Button>
          </div>

          {/* 开发环境下显示详细错误信息 */}
          {isDevelopment && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center gap-2">
                  {showDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  {showDetails ? '隐藏' : '显示'}错误详情
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-medium text-sm mb-2">错误堆栈：</h4>
                  <pre className="text-xs text-muted-foreground overflow-auto whitespace-pre-wrap break-words">
                    {error.stack}
                  </pre>
                </div>

                {info?.componentStack && (
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="font-medium text-sm mb-2">组件堆栈：</h4>
                    <pre className="text-xs text-muted-foreground overflow-auto whitespace-pre-wrap break-words">
                      {info.componentStack}
                    </pre>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* 帮助信息 */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>如果问题持续存在，请尝试以下操作：</p>
            <ul className="text-left space-y-1 max-w-md mx-auto">
              <li>• 刷新页面或重启应用程序</li>
              <li>• 检查网络连接</li>
              <li>• 清除缓存</li>
              <li>• 联系技术支持</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// React Error Boundary 类组件

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface ReactErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export class ReactErrorBoundary extends Component<ReactErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ReactErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return (
        <ErrorBoundary error={this.state.error} reset={this.reset} info={this.state.errorInfo} />
      )
    }

    return this.props.children
  }
}

// 简化版错误组件，用于 TanStack Router 的 defaultErrorComponent
export function DefaultErrorComponent({ error, reset }: { error: Error; reset?: () => void }) {
  return <ErrorBoundary error={error} reset={reset} />
}

// 轻量级错误组件，用于小区域的错误显示
export function InlineErrorBoundary({
  error,
  reset,
  title = '加载失败',
  showDetails = false
}: {
  error: Error
  reset?: () => void
  title?: string
  showDetails?: boolean
}) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-2">
        <div className="font-medium">{title}</div>
        <div className="text-sm">{error.message}</div>
        {showDetails && error.stack && (
          <details className="text-xs">
            <summary className="cursor-pointer">查看详情</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">{error.stack}</pre>
          </details>
        )}
        {reset && (
          <Button variant="outline" size="sm" onClick={reset} className="mt-2">
            <RefreshCw className="h-3 w-3 mr-1" />
            重试
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
