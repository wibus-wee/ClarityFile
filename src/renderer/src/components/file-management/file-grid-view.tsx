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
  Info,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
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

interface FileGridViewProps {
  files: any[]
  getFileTypeIcon: (mimeType: string) => any
  getFileTypeColor: (mimeType: string) => string
}

export function FileGridView({ files, getFileTypeIcon, getFileTypeColor }: FileGridViewProps) {
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

  return (
    <div className="h-full flex flex-col">
      {/* 网格容器 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          <AnimatePresence>
            {files.map((file, index) => {
              const FileIcon = getFileTypeIcon(file.mimeType)
              const isSelected = selectedFiles.has(file.id)
              const isHovered = hoveredFile === file.id

              return (
                <ContextMenu key={file.id}>
                  <ContextMenuTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.02 }}
                      className={cn(
                        'group relative bg-card border border-border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md',
                        isSelected && 'ring-2 ring-primary ring-offset-2 bg-primary/5',
                        isHovered && !isSelected && 'border-border/80 shadow-sm'
                      )}
                      onMouseEnter={() => setHoveredFile(file.id)}
                      onMouseLeave={() => setHoveredFile(null)}
                      onClick={() => toggleFileSelection(file.id)}
                    >
                      {/* 选择指示器 */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 z-10"
                        >
                          <CheckCircle2 className="w-5 h-5 text-primary bg-background rounded-full" />
                        </motion.div>
                      )}

                      {/* 操作按钮 */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered || isSelected ? 1 : 0 }}
                        className="absolute top-2 left-2 z-10"
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
                      </motion.div>

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
      </div>

      {/* 批量操作栏 */}
      {selectedFiles.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="border-t border-border bg-muted/50 px-6 py-4"
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
