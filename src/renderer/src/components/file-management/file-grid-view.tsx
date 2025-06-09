import { useState, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useFileActions } from '@renderer/hooks/use-file-actions'
import { useFileManagementStore } from '@renderer/stores/file-management'
import {
  MoreHorizontal,
  Eye,
  Download,
  Edit,
  Trash2,
  Copy,
  Share,
  Info,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@renderer/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { cn } from '@renderer/lib/utils'

interface FileGridViewProps {
  files: any[]
  getFileTypeIcon: (mimeType: string) => any
  getFileTypeColor: (mimeType: string) => string
}

export function FileGridView({ files, getFileTypeIcon, getFileTypeColor }: FileGridViewProps) {
  const {
    selectedFile,
    selectedFiles,
    selectionMode,
    lastClickedIndex,
    selectSingleFile,
    toggleFileSelection,
    selectFileRange,
    openBatchDeleteDialog
  } = useFileManagementStore()

  const [hoveredFile, setHoveredFile] = useState<string | null>(null)
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null)
  const { handleFileAction } = useFileActions()

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleBatchDelete = () => {
    const selectedFileObjects = files.filter((f) => selectedFiles.has(f.id))
    openBatchDeleteDialog(selectedFileObjects)
  }

  // 处理文件点击事件
  const handleFileClick = useCallback(
    (event: React.MouseEvent, file: any, fileIndex: number) => {
      event.preventDefault()

      // 清除之前的点击延时
      if (clickTimeout) {
        clearTimeout(clickTimeout)
        setClickTimeout(null)
      }

      const isMetaOrCtrl = event.metaKey || event.ctrlKey
      const isShift = event.shiftKey

      if (isShift && lastClickedIndex !== null && selectionMode === 'multiple') {
        // Shift + 点击：范围选择
        selectFileRange(lastClickedIndex, fileIndex, files)
      } else if (isMetaOrCtrl) {
        // Cmd/Ctrl + 点击：切换选择状态
        toggleFileSelection(file.id)
      } else {
        // 普通点击：延迟处理以区分单击和双击
        const timeout = setTimeout(() => {
          selectSingleFile(file.id, fileIndex)
          setClickTimeout(null)
        }, 200)
        setClickTimeout(timeout)
      }
    },
    [
      clickTimeout,
      lastClickedIndex,
      selectionMode,
      selectFileRange,
      toggleFileSelection,
      selectSingleFile,
      files
    ]
  )

  // 处理文件双击事件
  const handleFileDoubleClick = useCallback(
    (event: React.MouseEvent, file: any) => {
      event.preventDefault()

      // 清除单击延时
      if (clickTimeout) {
        clearTimeout(clickTimeout)
        setClickTimeout(null)
      }

      // 双击预览文件
      handleFileAction('preview', file)
    },
    [clickTimeout, handleFileAction]
  )

  return (
    <div className="h-full flex flex-col">
      {/* 网格容器 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {files.map((file, fileIndex) => {
            const FileIcon = getFileTypeIcon(file.mimeType)
            const isMultiSelected = selectedFiles.has(file.id)
            const isSingleSelected = selectedFile === file.id
            const isSelected = isMultiSelected || isSingleSelected
            const isHovered = hoveredFile === file.id

            return (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger asChild>
                  <div
                    className={cn(
                      'group relative bg-card border border-border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md',
                      // 多选模式的选中样式
                      isMultiSelected && 'ring-2 ring-primary ring-offset-2 bg-primary/5',
                      // 单选模式的选中样式（更轻微）
                      isSingleSelected &&
                        selectionMode === 'single' &&
                        'bg-muted/50 border-primary/30',
                      isHovered && !isSelected && 'border-border/80 shadow-sm'
                    )}
                    onMouseEnter={() => setHoveredFile(file.id)}
                    onMouseLeave={() => setHoveredFile(null)}
                    onClick={(e) => handleFileClick(e, file, fileIndex)}
                    onDoubleClick={(e) => handleFileDoubleClick(e, file)}
                  >
                    {/* 选择指示器 - 只在多选模式下显示 */}
                    {isMultiSelected && (
                      <div className="absolute top-2 right-2 z-10">
                        <CheckCircle2 className="w-5 h-5 text-primary bg-background rounded-full" />
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div
                      className={cn(
                        'absolute top-2 left-2 z-10 transition-opacity',
                        isHovered || isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => handleFileAction('preview', file)}>
                            <Eye className="w-4 h-4 mr-2" />
                            预览
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFileAction('download', file)}>
                            <Download className="w-4 h-4 mr-2" />
                            下载
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleFileAction('rename', file)}>
                            <Edit className="w-4 h-4 mr-2" />
                            重命名
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFileAction('copy', file)}>
                            <Copy className="w-4 h-4 mr-2" />
                            复制
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFileAction('share', file)}>
                            <Share className="w-4 h-4 mr-2" />
                            分享
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleFileAction('info', file)}>
                            <Info className="w-4 h-4 mr-2" />
                            属性
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleFileAction('delete', file)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* 文件图标 */}
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-3">
                        {file.mimeType?.startsWith('image/') ? (
                          // 图片预览
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <FileIcon className={cn('w-8 h-8', getFileTypeColor(file.mimeType))} />
                          </div>
                        ) : (
                          // 其他文件类型图标
                          <div className="w-16 h-16 bg-muted/50 rounded-lg flex items-center justify-center">
                            <FileIcon className={cn('w-8 h-8', getFileTypeColor(file.mimeType))} />
                          </div>
                        )}
                      </div>

                      {/* 文件信息 */}
                      <div className="w-full">
                        <h3 className="font-medium text-sm truncate mb-1" title={file.name}>
                          {file.name}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.fileSizeBytes)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(file.createdAt), {
                              addSuffix: true,
                              locale: zhCN
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>

                {/* 右键菜单 */}
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => handleFileAction('preview', file)}>
                    <Eye className="w-4 h-4 mr-2" />
                    预览
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleFileAction('download', file)}>
                    <Download className="w-4 h-4 mr-2" />
                    下载
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => handleFileAction('rename', file)}>
                    <Edit className="w-4 h-4 mr-2" />
                    重命名
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleFileAction('copy', file)}>
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleFileAction('share', file)}>
                    <Share className="w-4 h-4 mr-2" />
                    分享
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => handleFileAction('info', file)}>
                    <Info className="w-4 h-4 mr-2" />
                    属性
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => handleFileAction('delete', file)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            )
          })}
        </div>
      </div>

      {/* 批量操作栏 - 只在多选模式下显示 */}
      {selectionMode === 'multiple' && selectedFiles.size > 0 && (
        <div className="border-t border-border bg-muted/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              已选择 {selectedFiles.size} 个文件
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: 实现批量下载功能
                  console.log('批量下载功能待实现')
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                批量下载
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: 实现批量复制功能
                  console.log('批量复制功能待实现')
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                批量复制
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                批量删除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
