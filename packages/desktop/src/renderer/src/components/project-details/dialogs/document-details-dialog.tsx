import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@clarity/shadcn/ui/dialog'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Separator } from '@clarity/shadcn/ui/separator'
import { FileText, Calendar, Hash } from 'lucide-react'
import type { LogicalDocumentWithVersionsOutput } from '@main/types/document-schemas'

interface DocumentDetailsDialogProps {
  document: LogicalDocumentWithVersionsOutput | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentDetailsDialog({
  document,
  open,
  onOpenChange
}: DocumentDetailsDialogProps) {
  if (!document) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {document.name}
          </DialogTitle>
          <DialogDescription>查看逻辑文档的详细信息</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{document.type}</Badge>
              <Badge className={getStatusColor(document.status)}>{document.status}</Badge>
            </div>

            {document.description && (
              <div>
                <h4 className="text-sm font-medium mb-2">描述</h4>
                <p className="text-sm text-muted-foreground">{document.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">创建时间：</span>
                <span>{new Date(document.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">更新时间：</span>
                <span>{new Date(document.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            {document.defaultStoragePathSegment && (
              <div>
                <h4 className="text-sm font-medium mb-2">默认存储路径</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {document.defaultStoragePathSegment}
                </code>
              </div>
            )}
          </div>

          <Separator />

          {/* 版本信息 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">文档版本 ({document.versions.length})</h4>
            </div>

            {document.versions.length > 0 ? (
              <div className="space-y-3">
                {document.versions.map((version, index) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{version.versionTag}</span>
                        {version.isGenericVersion && (
                          <Badge variant="secondary" className="text-xs">
                            通用版本
                          </Badge>
                        )}
                        {version.competitionMilestone?.series.name && (
                          <Badge variant="outline" className="text-xs">
                            {version.competitionMilestone.series.name}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>文件名：{version.originalFileName}</div>
                      {version.fileSizeBytes && (
                        <div>大小：{(version.fileSizeBytes / 1024).toFixed(1)} KB</div>
                      )}
                      {version.notes && <div>备注：{version.notes}</div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无版本</p>
              </div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
