'use client'

import { Component, ReactNode, ErrorInfo, useState } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, Zap, Coffee } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@clarity/shadcn/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@clarity/shadcn/ui/collapsible'

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
      <style>{`
        * {
          user-select: initial;
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-2xl"
      >
        {/* 主要错误容器 */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-sm">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-destructive/5 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-500/5 to-transparent rounded-full blur-xl" />

          {/* 头部区域 */}
          <div className="relative p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20"
            >
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                哎呀，出了点问题
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                应用程序遇到了意外错误，别担心，我们来帮您解决
              </p>
            </motion.div>
          </div>

          {/* 错误信息区域 */}
          <div className="px-8 pb-8 space-y-6">
            {/* 错误消息 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative overflow-hidden rounded-xl border border-destructive/20 bg-gradient-to-r from-destructive/5 to-destructive/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                      <Bug className="h-4 w-4 text-destructive" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-destructive mb-1">错误详情</p>
                    <p className="text-sm text-destructive/80 break-words">
                      {error.message || '未知错误，请稍后重试'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 操作按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              {reset && (
                <Button
                  onClick={reset}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                >
                  <RefreshCw className="h-4 w-4" />
                  重新尝试
                </Button>
              )}

              <Button variant="outline" asChild className="border-border/50 hover:border-border">
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  返回首页
                </Link>
              </Button>
            </motion.div>

            {/* 开发环境下显示详细错误信息 */}
            {isDevelopment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center gap-2 border border-border/50 hover:border-border hover:bg-muted/50"
                    >
                      <motion.div
                        animate={{ rotate: showDetails ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                      {showDetails ? '隐藏' : '显示'}开发者信息
                    </Button>
                  </CollapsibleTrigger>

                  <AnimatePresence>
                    {showDetails && (
                      <CollapsibleContent asChild>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 mt-4"
                        >
                          <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                              <Bug className="h-4 w-4" />
                              错误堆栈
                            </h4>
                            <pre className="text-xs text-muted-foreground overflow-auto whitespace-pre-wrap break-words bg-background/50 rounded-lg p-3 border border-border/30">
                              {error.stack}
                            </pre>
                          </div>

                          {info?.componentStack && (
                            <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                组件堆栈
                              </h4>
                              <pre className="text-xs text-muted-foreground overflow-auto whitespace-pre-wrap break-words bg-background/50 rounded-lg p-3 border border-border/30">
                                {info.componentStack}
                              </pre>
                            </div>
                          )}
                        </motion.div>
                      </CollapsibleContent>
                    )}
                  </AnimatePresence>
                </Collapsible>
              </motion.div>
            )}

            {/* 帮助信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-r from-muted/20 to-muted/10 p-6"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-xl" />

              <div className="relative text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Coffee className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium text-foreground">需要帮助？</h3>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  如果问题持续存在，您可以尝试以下解决方案：
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span>刷新页面或重启应用</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span>检查网络连接状态</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    <span>清除应用缓存数据</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    <span>联系技术支持团队</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-4"
    >
      <div className="relative overflow-hidden rounded-xl border border-destructive/20 bg-gradient-to-r from-destructive/5 to-destructive/10 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="font-medium text-destructive">{title}</div>
            <div className="text-sm text-destructive/80">{error.message}</div>

            {showDetails && error.stack && (
              <details className="text-xs">
                <summary className="cursor-pointer text-destructive/70 hover:text-destructive transition-colors">
                  查看技术详情
                </summary>
                <pre className="mt-2 p-3 bg-background/50 rounded-lg border border-destructive/20 whitespace-pre-wrap break-words text-destructive/60">
                  {error.stack}
                </pre>
              </details>
            )}

            {reset && (
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                重试
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
