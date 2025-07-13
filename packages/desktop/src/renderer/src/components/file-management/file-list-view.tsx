import { useState, useCallback } from 'react'
import { formatFileSize, formatRelativeTime } from '@renderer/lib/i18n-formatters'

import { MoreHorizontal, Eye, Edit, Info, Trash2 } from 'lucide-react'
import { Button } from '@clarity/shadcn/ui/button'
import { Checkbox } from '@clarity/shadcn/ui/checkbox'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@clarity/shadcn/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import { cn } from '@renderer/lib/utils'
import { useFileManagementStore } from '@renderer/stores/file-management'

interface FileListViewProps {
  files: any[]
  getFileTypeIcon: (mimeType: string) => any
  getFileTypeColor: (mimeType: string) => string
  onFileAction: (action: string, file: any) => void
}

export function FileListView({
  files,
  getFileTypeIcon,
  getFileTypeColor,
  onFileAction
}: FileListViewProps) {
  const {
    selectedFile,
    selectedFiles,
    selectionMode,
    lastClickedIndex,
    selectSingleFile,
    toggleFileSelection,
    selectFileRange,
    selectAllFiles
  } = useFileManagementStore()

  const [hoveredFile, setHoveredFile] = useState<string | null>(null)
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null)

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
      onFileAction('preview', file)
    },
    [clickTimeout, onFileAction]
  )

  const handleSelectAllClick = () => {
    selectAllFiles(files)
  }

  return (
    <div className="h-full flex flex-col">
      {/* 表头 */}
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-muted-foreground">
          <div className="col-span-1 flex items-center">
            {selectionMode === 'multiple' && (
              <Checkbox
                checked={selectedFiles.size === files.length && files.length > 0}
                onCheckedChange={handleSelectAllClick}
                className="mr-2"
              />
            )}
          </div>
          <div className="col-span-5">名称</div>
          <div className="col-span-2">大小</div>
          <div className="col-span-2">类型</div>
          <div className="col-span-2">修改时间</div>
        </div>
      </div>

      {/* 文件列表 */}
      <div className="flex-1 overflow-auto">
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
                    'grid grid-cols-12 gap-4 items-center px-4 py-3 border-b border-border/50 transition-colors cursor-pointer hover:bg-muted/50',
                    // 多选模式的选中样式
                    isMultiSelected && 'bg-primary/10 border-primary/20',
                    // 单选模式的选中样式（更轻微）
                    isSingleSelected &&
                      selectionMode === 'single' &&
                      'bg-muted/50 border-primary/30',
                    isHovered && !isSelected && 'bg-muted/50'
                  )}
                  onMouseEnter={() => setHoveredFile(file.id)}
                  onMouseLeave={() => setHoveredFile(null)}
                  onClick={(e: React.MouseEvent) => handleFileClick(e, file, fileIndex)}
                  onDoubleClick={(e: React.MouseEvent) => handleFileDoubleClick(e, file)}
                >
                  {/* 选择框 - 只在多选模式下显示 */}
                  <div className="col-span-1 flex items-center">
                    {selectionMode === 'multiple' && (
                      <Checkbox
                        checked={isMultiSelected}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>

                  {/* 文件名和图标 */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <FileIcon
                      className={cn('w-5 h-5 flex-shrink-0', getFileTypeColor(file.mimeType))}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {file.originalFileName}
                      </p>
                    </div>
                  </div>

                  {/* 文件大小 */}
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {formatFileSize(file.fileSizeBytes)}
                  </div>

                  {/* 文件类型 */}
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {file.mimeType?.split('/')[0] || '未知'}
                  </div>

                  {/* 修改时间 */}
                  <div className="col-span-1 text-sm text-muted-foreground">
                    {formatRelativeTime(file.createdAt)}
                  </div>

                  {/* 操作按钮 */}
                  <div className="col-span-1 flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            'h-8 w-8 p-0 transition-opacity',
                            isHovered || isSelected ? 'opacity-100' : 'opacity-0'
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onFileAction('preview', file)}>
                          <Eye className="w-4 h-4 mr-2" />
                          预览
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onFileAction('rename', file)}>
                          <Edit className="w-4 h-4 mr-2" />
                          重命名
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onFileAction('info', file)}>
                          <Info className="w-4 h-4 mr-2" />
                          属性
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onFileAction('delete', file)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </ContextMenuTrigger>

              {/* 右键菜单 */}
              <ContextMenuContent>
                <ContextMenuItem onClick={() => onFileAction('preview', file)}>
                  <Eye className="w-4 h-4 mr-2" />
                  预览
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onFileAction('rename', file)}>
                  <Edit className="w-4 h-4 mr-2" />
                  重命名
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onFileAction('info', file)}>
                  <Info className="w-4 h-4 mr-2" />
                  属性
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={() => onFileAction('delete', file)}
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
  )
}
