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
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('projects')
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
            {t('dialogs.deleteDocument.title')}
          </DialogTitle>
          <DialogDescription>{t('dialogs.deleteDocument.description')}</DialogDescription>
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
                ⚠️ {t('dialogs.deleteDocument.warning', { count: document.versions.length })}
              </p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">{t('dialogs.deleteDocument.confirmText')}</p>
        </motion.div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            {t('dialogs.deleteDocument.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting
              ? t('dialogs.deleteDocument.deleting')
              : t('dialogs.deleteDocument.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
