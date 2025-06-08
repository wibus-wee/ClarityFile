import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { 
  MoreHorizontal, 
  Eye, 
  Download, 
  Edit, 
  Trash2, 
  Copy,
  Share,
  Info
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@renderer/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@renderer/components/ui/dropdown-menu'
import { cn } from '@renderer/lib/utils'

interface FileListViewProps {
  files: any[]
  getFileTypeIcon: (mimeType: string) => any
  getFileTypeColor: (mimeType: string) => string
}

export function FileListView({ files, getFileTypeIcon, getFileTypeColor }: FileListViewProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [hoveredFile, setHoveredFile] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleFileAction = (action: string, file: any) => {
    console.log(`执行操作: ${action}`, file)
    // TODO: 实现具体的文件操作
  }

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles)
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId)
    } else {
      newSelection.add(fileId)
    }
    setSelectedFiles(newSelection)
  }

  const selectAllFiles = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)))
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 表头 */}
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-muted-foreground">
          <div className="col-span-1 flex items-center">
            <Checkbox
              checked={selectedFiles.size === files.length && files.length > 0}
              onCheckedChange={selectAllFiles}
              className="mr-2"
            />
          </div>
          <div className="col-span-5">名称</div>
          <div className="col-span-2">大小</div>
          <div className="col-span-2">类型</div>
          <div className="col-span-2">修改时间</div>
        </div>
      </div>

      {/* 文件列表 */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence>
          {files.map((file, index) => {
            const FileIcon = getFileTypeIcon(file.mimeType)
            const isSelected = selectedFiles.has(file.id)
            const isHovered = hoveredFile === file.id

            return (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.02 }}
                    className={cn(
                      'grid grid-cols-12 gap-4 items-center px-4 py-3 border-b border-border/50 transition-colors cursor-pointer',
                      isSelected && 'bg-primary/10 border-primary/20',
                      isHovered && !isSelected && 'bg-muted/50'
                    )}
                    onMouseEnter={() => setHoveredFile(file.id)}
                    onMouseLeave={() => setHoveredFile(null)}
                    onClick={() => toggleFileSelection(file.id)}
                  >
                    {/* 选择框 */}
                    <div className="col-span-1 flex items-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* 文件名和图标 */}
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <FileIcon className={cn('w-5 h-5 flex-shrink-0', getFileTypeColor(file.mimeType))} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{file.originalFileName}</p>
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
                      {formatDistanceToNow(new Date(file.createdAt), { 
                        addSuffix: true, 
                        locale: zhCN 
                      })}
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
                  </motion.div>
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
        </AnimatePresence>
      </div>

      {/* 批量操作栏 */}
      {selectedFiles.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="border-t border-border bg-muted/50 px-4 py-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              已选择 {selectedFiles.size} 个文件
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                批量下载
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                批量复制
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                批量删除
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
