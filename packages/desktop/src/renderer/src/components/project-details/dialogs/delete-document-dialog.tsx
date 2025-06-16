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
import { AlertTriangle, FileText } from 'lucide-react'
import { useDeleteLogicalDocument } from '@renderer/hooks/use-tipc'
import type { LogicalDocumentWithVersionsOutput } from '@main/types/document-schemas'

interface DeleteDocumentDialogProps {
  document: LogicalDocumentWithVersionsOutput | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteDocumentDialog({
  document,
  open,
  onOpenChange,
  onSuccess
}: DeleteDocumentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteDocument = useDeleteLogicalDocument()

  const handleDelete = async () => {
    if (!document) return

    setIsDeleting(true)
    try {
      await deleteDocument.trigger({ id: document.id })
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('删除文档失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            删除文档
          </DialogTitle>
          <DialogDescription>此操作无法撤销，请确认是否继续。</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">{document.name}</h4>
                <p className="text-sm text-muted-foreground">{document.type}</p>
              </div>
            </div>
          </div>

          {document.versions.length > 0 && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                ⚠️ 此文档包含 {document.versions.length} 个版本，删除后所有版本都将被永久删除。
              </p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            删除后，此文档及其所有版本将无法恢复。请确认您真的要删除这个文档。
          </p>
        </motion.div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            取消
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? '删除中...' : '确认删除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
