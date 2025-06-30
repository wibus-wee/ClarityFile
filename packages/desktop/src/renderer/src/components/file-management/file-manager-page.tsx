import { useState, useEffect } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import {
  Search,
  SlidersHorizontal,
  Upload,
  FolderOpen,
  File,
  Image,
  FileText,
  Video,
  Music,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Input } from '@clarity/shadcn/ui/input'
import { Button } from '@clarity/shadcn/ui/button'
import { Separator } from '@clarity/shadcn/ui/separator'
import { Badge } from '@clarity/shadcn/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import { cn } from '@renderer/lib/utils'
import { useGlobalFiles, useFileSystemStats } from '@renderer/hooks/use-tipc'
import { useFileActions } from '@renderer/hooks/use-file-actions'
import { useFileManagementStore } from '@renderer/stores/file-management'
import { MimeTypeUtils } from '@renderer/utils/mime-type-utils'
import { FileListView } from './file-list-view'
import { FileStatsOverview } from './file-stats-overview'
import { FileFilterSidebar } from './file-filter-sidebar'
import { FileRenameDialog } from './file-rename-dialog'
import { FileDeleteDialog } from './file-delete-dialog'
import { FileInfoDrawer } from './file-info-drawer'
import { QuickLookIndicator } from './quicklook-indicator'

export function FileManagerPage() {
  const search = useSearch({ from: '/files' })
  const navigate = useNavigate({ from: '/files' })
  const [searchQuery, setSearchQuery] = useState(search.search || '')
  const [showFilters, setShowFilters] = useState(true)

  const { handleUpload, handleFileAction } = useFileActions()
  const { fileForInfo, isInfoDrawerOpen, closeInfoDrawer } = useFileManagementStore()

  // 同步搜索框和URL参数
  useEffect(() => {
    setSearchQuery(search.search || '')
  }, [search.search])

  // 更新URL参数的函数
  const updateSearchParams = (updates: Partial<typeof search>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates }),
      replace: true
    })
  }

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

  // 文件类型图标映射
  const getFileTypeIcon = (mimeType: string) => {
    if (MimeTypeUtils.isImageFile(mimeType)) return Image
    if (MimeTypeUtils.isVideoFile(mimeType)) return Video
    if (MimeTypeUtils.isAudioFile(mimeType)) return Music
    if (MimeTypeUtils.isDocumentFile(mimeType)) return FileText
    return File
  }

  // 文件类型颜色映射
  const getFileTypeColor = (mimeType: string) => {
    if (MimeTypeUtils.isImageFile(mimeType)) return 'text-green-600'
    if (MimeTypeUtils.isVideoFile(mimeType)) return 'text-purple-600'
    if (MimeTypeUtils.isAudioFile(mimeType)) return 'text-blue-600'
    if (MimeTypeUtils.isDocumentFile(mimeType)) return 'text-orange-600'
    return 'text-gray-600'
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-background">
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
                  onChange={(e) => {
                    const value = e.target.value
                    setSearchQuery(value)
                    // 防抖更新URL
                    const timeoutId = setTimeout(() => {
                      updateSearchParams({ search: value || undefined })
                    }, 300)
                    return () => clearTimeout(timeoutId)
                  }}
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

            {/* 操作按钮 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* 排序选择 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {search.sortOrder === 'asc' ? (
                      <ArrowUp className="w-4 h-4 mr-2" />
                    ) : (
                      <ArrowDown className="w-4 h-4 mr-2" />
                    )}
                    排序
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      updateSearchParams({
                        sortBy: 'name',
                        sortOrder:
                          search.sortBy === 'name' && search.sortOrder === 'asc' ? 'desc' : 'asc'
                      })
                    }
                  >
                    按名称排序
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      updateSearchParams({
                        sortBy: 'date',
                        sortOrder:
                          search.sortBy === 'date' && search.sortOrder === 'asc' ? 'desc' : 'asc'
                      })
                    }
                  >
                    按日期排序
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      updateSearchParams({
                        sortBy: 'size',
                        sortOrder:
                          search.sortBy === 'size' && search.sortOrder === 'asc' ? 'desc' : 'asc'
                      })
                    }
                  >
                    按大小排序
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      updateSearchParams({
                        sortBy: 'type',
                        sortOrder:
                          search.sortBy === 'type' && search.sortOrder === 'asc' ? 'desc' : 'asc'
                      })
                    }
                  >
                    按类型排序
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="h-6" />

              {/* 上传按钮 */}
              <Button size="sm" onClick={handleUpload}>
                <Upload className="w-4 h-4 mr-2" />
                上传文件
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* QuickLook 状态指示器 */}
              <QuickLookIndicator />
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
                <Button onClick={handleUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  上传文件
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <FileListView
                files={filesData?.files || []}
                getFileTypeIcon={getFileTypeIcon}
                getFileTypeColor={getFileTypeColor}
                onFileAction={handleFileAction}
              />
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

      {/* 左侧筛选面板 */}
      <div
        className={cn(
          'h-full border-l border-border overflow-hidden flex-shrink-0 transition-all duration-200',
          showFilters ? 'w-[280px]' : 'w-0'
        )}
      >
        {showFilters && (
          <FileFilterSidebar
            onFilterChange={(filters) => {
              updateSearchParams(filters)
            }}
          />
        )}
      </div>

      {/* Dialog和Drawer组件 */}
      <FileRenameDialog />
      <FileDeleteDialog />
      <FileInfoDrawer
        file={fileForInfo}
        isOpen={isInfoDrawerOpen}
        onClose={closeInfoDrawer}
        getFileTypeIcon={getFileTypeIcon}
        getFileTypeColor={getFileTypeColor}
      />
    </div>
  )
}
