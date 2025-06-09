import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { MimeTypeUtils } from '@renderer/utils/mime-type-utils'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@renderer/components/ui/drawer'
import { Badge } from '@renderer/components/ui/badge'
import { Separator } from '@renderer/components/ui/separator'
import { File, Calendar, HardDrive, Tag, FolderOpen } from 'lucide-react'

interface FileInfoDrawerProps {
  file: any | null
  isOpen: boolean
  onClose: () => void
  getFileTypeIcon: (mimeType: string) => any
  getFileTypeColor: (mimeType: string) => string
}

export function FileInfoDrawer({
  file,
  isOpen,
  onClose,
  getFileTypeIcon,
  getFileTypeColor
}: FileInfoDrawerProps) {
  if (!file) return null

  const FileIcon = getFileTypeIcon(file.mimeType)

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileTypeLabel = (mimeType: string) => {
    return MimeTypeUtils.getFileTypeLabel(mimeType)
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[80vh] flex flex-col">
        <DrawerHeader className="text-left flex-shrink-0">
          <DrawerTitle className="flex items-center gap-3">
            <FileIcon className={`w-6 h-6 ${getFileTypeColor(file.mimeType)}`} />
            文件属性
          </DrawerTitle>
          <DrawerDescription>查看文件的详细信息和元数据</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          {/* 基本信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <File className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">基本信息</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 pl-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">文件名</label>
                <p className="text-sm font-mono bg-muted/50 rounded-md px-3 py-2 break-all">
                  {file.name}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">原始文件名</label>
                <p className="text-sm font-mono bg-muted/50 rounded-md px-3 py-2 break-all">
                  {file.originalFileName}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">文件类型</label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">
                    {getFileTypeLabel(file.mimeType)}
                  </Badge>
                  {file.mimeType && (
                    <span className="text-xs text-muted-foreground font-mono">{file.mimeType}</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* 文件大小和时间信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">存储信息</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">文件大小</label>
                <p className="text-sm">{formatFileSize(file.fileSizeBytes || 0)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">文件ID</label>
                <p className="text-xs font-mono text-muted-foreground break-all">{file.id}</p>
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* 时间信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">时间信息</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 pl-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">创建时间</label>
                <div className="space-y-1">
                  <p className="text-sm">{new Date(file.createdAt).toLocaleString('zh-CN')}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(file.createdAt), {
                      addSuffix: true,
                      locale: zhCN
                    })}
                  </p>
                </div>
              </div>

              {file.updatedAt && file.updatedAt !== file.createdAt && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">更新时间</label>
                  <div className="space-y-1">
                    <p className="text-sm">{new Date(file.updatedAt).toLocaleString('zh-CN')}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(file.updatedAt), {
                        addSuffix: true,
                        locale: zhCN
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <Separator />

          {/* 路径信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">路径信息</h3>
            </div>

            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">物理路径</label>
                <p className="text-xs font-mono bg-muted/50 rounded-md px-3 py-2 break-all">
                  {file.physicalPath}
                </p>
              </div>
            </div>
          </motion.div>

          {/* 其他元数据 */}
          {(file.fileHash || file.tags) && (
            <>
              <Separator />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium">其他信息</h3>
                </div>

                <div className="space-y-4 pl-6">
                  {file.fileHash && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">文件哈希</label>
                      <p className="text-xs font-mono bg-muted/50 rounded-md px-3 py-2 break-all">
                        {file.fileHash}
                      </p>
                    </div>
                  )}

                  {file.tags && file.tags.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">标签</label>
                      <div className="flex flex-wrap gap-2">
                        {file.tags.map((tag: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag.name || tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
