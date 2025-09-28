import { useState } from 'react'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import {
  FileText,
  ArrowRight,
  Calendar,
  MoreHorizontal,
  ExternalLink,
  File,
  Eye,
  Download,
  Edit,
  Trash2
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  useManagedFiles,
  useQuickLookPreviewById,
  useOpenFileByIdWithSystem,
  useIsQuickLookAvailable,
  useRenameFile,
  useMoveFileToTrash,
  useSaveFileAs
} from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { formatRelativeTime } from '@renderer/lib/i18n-formatters'

// 确保文件名包含扩展名的工具函数
const ensureFileExtension = (fileName: string, originalFileName: string): string => {
  // 检查文件名是否已经包含扩展名
  const fileNameParts = fileName.split('.')
  const hasExtension =
    fileNameParts.length > 1 && fileNameParts[fileNameParts.length - 1].length > 0

  if (hasExtension) {
    return fileName
  }

  // 从原始文件名中提取扩展名
  const originalParts = originalFileName.split('.')
  if (originalParts.length > 1) {
    const originalExt = originalParts[originalParts.length - 1]
    return `${fileName}.${originalExt}`
  }

  return fileName
}

// 文件类型图标映射
const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'pdf':
      return { icon: FileText, color: 'text-red-600 dark:text-red-400' }
    case 'doc':
    case 'docx':
      return { icon: FileText, color: 'text-blue-600 dark:text-blue-400' }
    case 'ppt':
    case 'pptx':
      return { icon: FileText, color: 'text-orange-600 dark:text-orange-400' }
    case 'xls':
    case 'xlsx':
      return { icon: FileText, color: 'text-green-600 dark:text-green-400' }
    default:
      return { icon: File, color: 'text-muted-foreground' }
  }
}

export function RecentDocumentsSection() {
  const { data: files, isLoading, error } = useManagedFiles(5, 0)
  const { trigger: quickLookPreview } = useQuickLookPreviewById()
  const { trigger: openFileWithSystem } = useOpenFileByIdWithSystem()
  const { data: quickLookAvailable } = useIsQuickLookAvailable()
  const { trigger: renameFile } = useRenameFile()
  const { trigger: moveFileToTrash } = useMoveFileToTrash()
  const { trigger: saveFileAs } = useSaveFileAs()
  const [actionInProgress, setActionInProgress] = useState(false)

  // 处理文档预览
  const handlePreviewDocument = async (file: any) => {
    try {
      // 检查文件是否存在physicalPath
      if (!file.physicalPath) {
        toast.error('文件路径不存在，无法预览')
        return
      }

      // 检查是否在 macOS 上且 QuickLook 可用
      if (quickLookAvailable?.available) {
        try {
          await quickLookPreview({ fileId: file.id })
          return
        } catch (quickLookError) {
          console.warn('QuickLook 预览失败，回退到系统默认应用:', quickLookError)
          // 如果 QuickLook 失败，回退到系统默认应用
        }
      }

      // 回退到系统默认应用
      await openFileWithSystem({ fileId: file.id })
    } catch (error) {
      console.error('预览文件失败:', error)
      toast.error(`预览文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 处理用系统默认应用打开文档
  const handleOpenDocument = async (file: any) => {
    try {
      // 检查文件是否存在physicalPath
      if (!file.physicalPath) {
        toast.error('文件路径不存在，无法打开')
        return
      }

      await openFileWithSystem({ fileId: file.id })
    } catch (error) {
      console.error('打开文件失败:', error)
      toast.error(`打开文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleDownloadDocument = async (file: any) => {
    if (actionInProgress) return

    try {
      setActionInProgress(true)
      const result = await saveFileAs({ fileId: file.id })

      if (!result?.success) {
        toast.info('已取消下载')
        return
      }

      toast.success(`文档已保存到 ${result.targetPath || '指定位置'}`)
    } catch (error) {
      console.error('下载文档失败:', error)
      toast.error(`下载文档失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setActionInProgress(false)
    }
  }

  const handleRenameDocument = async (file: any) => {
    if (actionInProgress) return

    try {
      const currentName = file.originalFileName || file.name
      const extension = currentName?.match(/\.[^/.]+$/)?.[0] || ''
      const defaultName = currentName?.replace(/\.[^/.]+$/, '') || ''
      const newName = window.prompt('请输入新的文件名', defaultName)

      if (!newName || newName.trim() === defaultName) {
        return
      }

      setActionInProgress(true)
      const normalized = newName.trim().replace(/[<>:"/\\|?*]/g, '')
      if (!normalized) {
        toast.error('文件名不能为空或包含非法字符')
        return
      }

      const finalName = `${normalized}${extension}`
      await renameFile({ fileId: file.id, newName: finalName })
      toast.success(`文件已重命名为 ${finalName}`)
    } catch (error) {
      console.error('重命名文件失败:', error)
      toast.error(`重命名文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setActionInProgress(false)
    }
  }

  const handleDeleteDocument = async (file: any) => {
    if (actionInProgress) return

    try {
      const confirmed = window.confirm(
        `确定要将文档 "${file.originalFileName || file.name}" 移动到回收站吗？`
      )
      if (!confirmed) {
        return
      }

      setActionInProgress(true)
      await moveFileToTrash({ fileId: file.id })
      toast.success('文档已移动到回收站')
    } catch (error) {
      console.error('删除文档失败:', error)
      toast.error(`删除文档失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setActionInProgress(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">最近文档</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">最近文档</h2>
        <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
          <p className="text-sm text-destructive">加载文档失败</p>
        </div>
      </div>
    )
  }

  const recentFiles = files || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">最近文档</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/projects">
            查看全部
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      {recentFiles.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">还没有文档</p>
          <Button asChild>
            <Link to="/projects">添加第一个文档</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentFiles.map((file, index) => {
            // 确保文件名包含扩展名
            const displayFileName = ensureFileExtension(file.name, file.originalFileName)
            const fileIcon = getFileIcon(displayFileName)
            const FileIcon = fileIcon.icon

            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative"
              >
                <div
                  className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary/30 hover:bg-accent/50 transition-all duration-200 cursor-pointer"
                  onClick={() => handlePreviewDocument(file)}
                >
                  {/* 文件图标 */}
                  <div className="p-2 bg-accent/50 rounded-lg">
                    <FileIcon className={`w-5 h-5 ${fileIcon.color}`} />
                  </div>

                  {/* 文件信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{displayFileName}</h3>
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50"
                      >
                        文档
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {file.originalFileName}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatRelativeTime(file.updatedAt.toISOString())}</span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenDocument(file)
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewDocument(file)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          预览文档
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDocument(file)
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          用默认应用打开
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadDocument(file)
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          下载文档
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRenameDocument(file)
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          重命名
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDocument(file)
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除文档
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
