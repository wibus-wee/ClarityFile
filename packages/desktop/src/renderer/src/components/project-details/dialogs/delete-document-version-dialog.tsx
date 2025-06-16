import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@clarity/shadcn/ui/dialog'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Separator } from '@clarity/shadcn/ui/separator'
import { AlertTriangle, Trash2, FileText, Calendar, Trophy } from 'lucide-react'
import { useDeleteDocumentVersion } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { formatFileSize } from '@renderer/lib/utils'
import type { DocumentVersionOutput } from '@main/types/document-schemas'

interface DeleteDocumentVersionDialogProps {
  version: DocumentVersionOutput | null
  isOfficialVersion?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteDocumentVersionDialog({
  version,
  isOfficialVersion = false,
  open,
  onOpenChange,
  onSuccess
}: DeleteDocumentVersionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteDocumentVersion = useDeleteDocumentVersion()

  const handleDelete = async () => {
    if (!version) return

    setIsDeleting(true)
    try {
      await deleteDocumentVersion.trigger({ id: version.id })

      toast.success('文档版本删除成功', {
        description: `版本 "${version.versionTag}" 已被删除`
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('删除文档版本失败:', error)
      toast.error('删除文档版本失败', {
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!version) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            删除文档版本
          </DialogTitle>
          <DialogDescription>此操作不可撤销，请确认是否要删除此文档版本。</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* 警告信息 */}
          {isOfficialVersion && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <div className="font-medium text-destructive">警告：官方版本</div>
                <div className="text-sm text-destructive/80">
                  此版本是当前的官方版本。删除后，逻辑文档将没有官方版本。
                </div>
              </div>
            </div>
          )}

          {/* 版本信息 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">版本信息</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">版本标签:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{version.versionTag}</span>
                  {version.isGenericVersion && <Badge variant="secondary">通用版本</Badge>}
                  {isOfficialVersion && <Badge variant="default">官方版本</Badge>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">文件名:</span>
                <span className="font-mono text-xs">{version.originalFileName}</span>
              </div>

              {version.fileSizeBytes && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">文件大小:</span>
                  <span>{formatFileSize(version.fileSizeBytes)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">创建时间:</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span>{new Date(version.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {version.competitionMilestone && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">关联赛事:</span>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs">
                      {version.competitionMilestone.series.name} -{' '}
                      {version.competitionMilestone.levelName}
                    </span>
                  </div>
                </div>
              )}

              {version.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground">备注:</span>
                    <div className="mt-1 p-2 bg-muted/50 rounded text-xs">{version.notes}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 删除影响说明 */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="font-medium">删除后的影响：</div>
            <ul className="space-y-1 text-xs">
              <li>• 版本记录将从数据库中永久删除</li>
              <li>• 关联的文件将被移除</li>
              {isOfficialVersion && (
                <li className="text-destructive">• 逻辑文档将失去官方版本引用</li>
              )}
              <li>• 此操作无法撤销</li>
            </ul>
          </div>
        </motion.div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isDeleting}>
            取消
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              '删除中...'
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                确认删除
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
