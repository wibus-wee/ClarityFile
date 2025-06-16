import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@clarity/shadcn/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@clarity/shadcn/ui/card'
import { ReactErrorBoundary, InlineErrorBoundary } from '@renderer/components/error-boundary'
import { NotFound, InlineNotFound } from '@renderer/components/not-found'

export const Route = createFileRoute('/error-test')({
  component: ErrorTestPage
})

function ErrorTestPage() {
  const [showError, setShowError] = useState(false)
  const [inlineError, setInlineError] = useState<Error | null>(null)
  const [showNotFound, setShowNotFound] = useState(false)
  const [showInlineNotFound, setShowInlineNotFound] = useState(false)

  const triggerError = () => {
    setShowError(true)
  }

  const triggerInlineError = () => {
    setInlineError(new Error('这是一个内联错误示例'))
  }

  const triggerRouteError = () => {
    throw new Error('这是一个路由级别的错误')
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">错误边界测试页面</h1>
        <p className="text-muted-foreground mt-2">这个页面用于测试不同类型的错误边界组件</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 路由错误测试 */}
        <Card>
          <CardHeader>
            <CardTitle>路由错误测试</CardTitle>
            <CardDescription>测试 TanStack Router 的默认错误组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={triggerRouteError} variant="destructive">
              触发路由错误
            </Button>
          </CardContent>
        </Card>

        {/* React 错误边界测试 */}
        <Card>
          <CardHeader>
            <CardTitle>React 错误边界测试</CardTitle>
            <CardDescription>测试 React 错误边界类组件</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactErrorBoundary
              onError={(error, errorInfo) => {
                console.log('错误被捕获:', error, errorInfo)
              }}
            >
              <ErrorComponent shouldError={showError} />
            </ReactErrorBoundary>
            <Button
              onClick={triggerError}
              variant="destructive"
              className="mt-4"
              disabled={showError}
            >
              触发组件错误
            </Button>
          </CardContent>
        </Card>

        {/* 内联错误测试 */}
        <Card>
          <CardHeader>
            <CardTitle>内联错误测试</CardTitle>
            <CardDescription>测试轻量级内联错误组件</CardDescription>
          </CardHeader>
          <CardContent>
            {inlineError ? (
              <InlineErrorBoundary
                error={inlineError}
                reset={() => setInlineError(null)}
                title="数据加载失败"
                showDetails={true}
              />
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">点击按钮查看内联错误组件</p>
                <Button onClick={triggerInlineError} variant="outline">
                  触发内联错误
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 自定义错误回退测试 */}
        <Card>
          <CardHeader>
            <CardTitle>自定义错误回退</CardTitle>
            <CardDescription>测试自定义错误回退组件</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactErrorBoundary
              fallback={(error, reset) => (
                <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                  <h4 className="font-medium text-destructive mb-2">自定义错误页面</h4>
                  <p className="text-sm text-muted-foreground mb-3">{error.message}</p>
                  <Button size="sm" onClick={reset}>
                    重置组件
                  </Button>
                </div>
              )}
            >
              <CustomErrorComponent />
            </ReactErrorBoundary>
          </CardContent>
        </Card>

        {/* 404 页面测试 */}
        <Card>
          <CardHeader>
            <CardTitle>404 页面测试</CardTitle>
            <CardDescription>测试完整的 404 页面组件</CardDescription>
          </CardHeader>
          <CardContent>
            {showNotFound ? (
              <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <NotFound
                  title="测试页面未找到"
                  description="这是一个 404 页面组件的测试展示"
                  showSearch={true}
                  showSuggestions={true}
                  className="min-h-0"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">点击按钮查看完整的 404 页面</p>
                <Button onClick={() => setShowNotFound(true)} variant="outline">
                  显示 404 页面
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 内联 404 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>内联 404 测试</CardTitle>
            <CardDescription>测试轻量级内联 404 组件</CardDescription>
          </CardHeader>
          <CardContent>
            {showInlineNotFound ? (
              <InlineNotFound
                title="内容未找到"
                description="这是一个内联 404 组件的测试"
                action={
                  <Button variant="outline" size="sm" onClick={() => setShowInlineNotFound(false)}>
                    重置
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">点击按钮查看内联 404 组件</p>
                <Button onClick={() => setShowInlineNotFound(true)} variant="outline">
                  显示内联 404
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. 路由错误</h4>
            <p className="text-sm text-muted-foreground">
              触发后会显示全屏错误页面，包含重试和返回首页按钮
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">2. React 错误边界</h4>
            <p className="text-sm text-muted-foreground">捕获组件渲染错误，显示默认错误界面</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">3. 内联错误</h4>
            <p className="text-sm text-muted-foreground">
              适合在小区域显示错误信息，不会影响整个页面
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">4. 自定义回退</h4>
            <p className="text-sm text-muted-foreground">可以完全自定义错误显示的样式和内容</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">5. 404 页面</h4>
            <p className="text-sm text-muted-foreground">完整的 404 页面，包含搜索功能和页面推荐</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">6. 内联 404</h4>
            <p className="text-sm text-muted-foreground">
              轻量级 404 组件，适合在小区域显示未找到状态
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 测试组件 - 会抛出错误
function ErrorComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('这是一个测试错误：组件渲染失败')
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-green-800">组件正常渲染</p>
    </div>
  )
}

// 自定义错误组件
function CustomErrorComponent() {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    throw new Error('自定义错误组件测试')
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">这是一个自定义错误回退测试组件</p>
      <Button size="sm" variant="outline" onClick={() => setShouldError(true)}>
        触发错误
      </Button>
    </div>
  )
}
