'use client'

import { Search, Home, ArrowLeft, FileQuestion } from 'lucide-react'
import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'

import { Button } from '@clarity/shadcn/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@clarity/shadcn/ui/card'
import { Input } from '@clarity/shadcn/ui/input'

interface NotFoundProps {
  title?: string
  description?: string
  showSearch?: boolean
  showSuggestions?: boolean
  className?: string
}

export function NotFound({
  title = '页面未找到',
  description = '抱歉，您访问的页面不存在或已被移动。',
  showSearch = true,
  className = ''
}: NotFoundProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // 这里可以实现搜索逻辑，比如跳转到搜索页面
      console.log('搜索:', searchQuery)
    }
  }

  const goBack = () => {
    if (window.history.length > 1) {
      router.history.back()
    } else {
      router.navigate({ to: '/' })
    }
  }

  return (
    <div className={`flex items-center justify-center p-4 bg-background ${className}`}>
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <div className="text-6xl font-bold text-muted-foreground">404</div>
            <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
            <CardDescription className="text-base max-w-md mx-auto">{description}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* 搜索框 */}
          {showSearch && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-center">尝试搜索您要找的内容</h3>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="搜索页面、功能或内容..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={!searchQuery.trim()}>
                  搜索
                </Button>
              </form>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={goBack} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回上页
            </Button>

            <Button asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                返回首页
              </Link>
            </Button>
          </div>

          {/* 帮助信息 */}
          <div className="text-center text-sm text-muted-foreground space-y-2 pt-4 border-t">
            <p>如果您认为这是一个错误，请联系技术支持。</p>
            <p className="text-xs">错误代码: 404 | 时间: {new Date().toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 简化版 404 组件，用于 TanStack Router 的 notFoundComponent
export function DefaultNotFound() {
  return <NotFound />
}

// 内联 404 组件，用于小区域的未找到状态
export function InlineNotFound({
  title = '内容未找到',
  description = '请求的内容不存在',
  action
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-6 w-6 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>

      {action || (
        <Button variant="outline" size="sm" asChild>
          <Link to="/">返回首页</Link>
        </Button>
      )}
    </div>
  )
}
