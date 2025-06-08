import { useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  Search,
  Grid3X3,
  List,
  SlidersHorizontal,
  Upload,
  FolderOpen,
  File,
  Image,
  FileText,
  Video,
  Music
} from 'lucide-react'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { Separator } from '@renderer/components/ui/separator'
import { Badge } from '@renderer/components/ui/badge'
import { cn } from '@renderer/lib/utils'
import { useGlobalFiles, useFileSystemStats } from '@renderer/hooks/use-tipc'
import { FileListView } from './file-list-view'
import { FileGridView } from './file-grid-view'
import { FileStatsOverview } from './file-stats-overview'
import { FileFilterSidebar } from './file-filter-sidebar'

type ViewMode = 'grid' | 'list' | 'details'

export function FileManagerPage() {
  const search = useSearch({ from: '/files' })
  const [searchQuery, setSearchQuery] = useState(search.search || '')
  const [showFilters, setShowFilters] = useState(false)

  // 获取文件数据
  const { data: filesData, isLoading } = useGlobalFiles({
    search: search.search,
    type: search.type,
    projectId: search.project,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
    limit: 50
  })

  const { data: statsData } = useFileSystemStats()

  const viewMode = search.view as ViewMode

  // 文件类型图标映射
  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return Image
    if (mimeType?.startsWith('video/')) return Video
    if (mimeType?.startsWith('audio/')) return Music
    if (mimeType?.includes('text') || mimeType?.includes('document')) return FileText
    return File
  }

  // 文件类型颜色映射
  const getFileTypeColor = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return 'text-green-600'
    if (mimeType?.startsWith('video/')) return 'text-purple-600'
    if (mimeType?.startsWith('audio/')) return 'text-blue-600'
    if (mimeType?.includes('text') || mimeType?.includes('document')) return 'text-orange-600'
    return 'text-gray-600'
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-background">
      {/* 左侧筛选面板 */}
      <motion.div
        initial={{ width: showFilters ? 280 : 0 }}
        animate={{ width: showFilters ? 280 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="h-full border-r border-border overflow-hidden flex-shrink-0"
      >
        {showFilters && (
          <FileFilterSidebar
            onFilterChange={(_filters) => {
              // TODO: 更新URL参数
            }}
          />
        )}
      </motion.div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* 顶部工具栏 */}
        <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* 搜索框 */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索文件..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 筛选按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn('transition-colors flex-shrink-0', showFilters && 'bg-muted')}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                筛选
              </Button>
            </div>

            {/* 视图切换和操作按钮 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* 视图切换 */}
              <div className="flex items-center bg-muted rounded-md p-1">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 px-3 rounded-md transition-all border-0',
                      viewMode === 'grid'
                        ? 'bg-background text-foreground shadow-sm border border-border/50'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 px-3 rounded-md transition-all border-0',
                      viewMode === 'list'
                        ? 'bg-background text-foreground shadow-sm border border-border/50'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* 上传按钮 */}
              <Button size="sm">
                <Upload className="w-4 h-4 mr-2" />
                上传文件
              </Button>
            </div>
          </div>

          {/* 统计信息 */}
          {statsData && (
            <div className="px-4 pb-4">
              <FileStatsOverview stats={statsData} />
            </div>
          )}
        </div>

        {/* 文件列表区域 */}
        <div className="flex-1 overflow-hidden min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">加载文件中...</p>
              </div>
            </div>
          ) : filesData?.files.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">暂无文件</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? '没有找到匹配的文件' : '开始上传文件到ClarityFile'}
                </p>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  上传文件
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {viewMode === 'grid' ? (
                <FileGridView
                  files={filesData?.files || []}
                  getFileTypeIcon={getFileTypeIcon}
                  getFileTypeColor={getFileTypeColor}
                />
              ) : (
                <FileListView
                  files={filesData?.files || []}
                  getFileTypeIcon={getFileTypeIcon}
                  getFileTypeColor={getFileTypeColor}
                />
              )}
            </div>
          )}
        </div>

        {/* 底部状态栏 */}
        {filesData && (
          <div className="flex-shrink-0 border-t border-border bg-muted/30 px-4 py-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>{filesData.files.length} 个文件</span>
                {filesData.hasMore && (
                  <Badge variant="secondary" className="text-xs">
                    还有更多文件
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {search.type && (
                  <Badge variant="outline" className="text-xs">
                    类型: {search.type}
                  </Badge>
                )}
                {search.project && (
                  <Badge variant="outline" className="text-xs">
                    项目: {search.project}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
