import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@clarity/shadcn/ui/dialog'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Button } from '@clarity/shadcn/ui/button'
import { Separator } from '@clarity/shadcn/ui/separator'
import { formatFileSize } from '@renderer/lib/utils'
import { FileText, Calendar, Download, HardDrive, FileType } from 'lucide-react'
import type { DocumentVersionOutput } from '@main/types/document-schemas'

interface DocumentVersionDetailsDialogProps {
  version: DocumentVersionOutput | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentVersionDetailsDialog({
  version,
  open,
  onOpenChange
}: DocumentVersionDetailsDialogProps) {
  const handleDownload = () => {
    if (!version) return
    // TODO: 实现下载功能
    console.log('下载版本:', version.id)
  }

  if (!version) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            文档版本详情
          </DialogTitle>
          <DialogDescription>查看文档版本的详细信息</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 版本标识 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-lg">{version.versionTag}</span>
              {version.isGenericVersion && <Badge variant="secondary">通用版本</Badge>}
            </div>

            {version.competitionMilestone && (
              <div>
                <span className="text-sm text-muted-foreground">关联赛事：</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{version.competitionMilestone.series.name}</Badge>
                  <Badge variant="secondary">{version.competitionMilestone.levelName}</Badge>
                  {version.competitionMilestone.dueDate && (
                    <span className="text-xs text-muted-foreground">
                      截止：{new Date(version.competitionMilestone.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* 文件信息 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">文件信息</h4>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <FileType className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">文件名：</span>
                <span className="font-mono">{version.originalFileName}</span>
              </div>

              {version.fileSizeBytes && (
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">文件大小：</span>
                  <span>{formatFileSize(version.fileSizeBytes)}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">创建时间：</span>
                <span>{new Date(version.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {version.notes && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">版本备注</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {version.notes}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* 操作按钮 */}
          <div className="flex justify-end">
            <Button onClick={handleDownload} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              下载文件
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
