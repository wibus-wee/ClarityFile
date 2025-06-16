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
import { SafeImage } from '@renderer/components/ui/safe-image'
import { AlertTriangle, Image, Star } from 'lucide-react'
import { useDeleteProjectAsset } from '@renderer/hooks/use-tipc'

interface DeleteAssetDialogProps {
  asset: any | null // 使用 ProjectDetailsOutput['assets'][0] 类型
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  isCurrentCover?: boolean
}

export function DeleteAssetDialog({
  asset,
  open,
  onOpenChange,
  onSuccess,
  isCurrentCover = false
}: DeleteAssetDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteAsset = useDeleteProjectAsset()

  const handleDelete = async () => {
    if (!asset) return

    setIsDeleting(true)
    try {
      await deleteAsset.trigger({ id: asset.id })
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('删除资产失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!asset) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            删除资产
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
              <div className="w-12 h-12 bg-muted/20 rounded flex items-center justify-center shrink-0 overflow-hidden">
                {asset.mimeType?.startsWith('image/') ? (
                  <SafeImage
                    filePath={asset.physicalPath}
                    alt={asset.name}
                    className="w-full h-full object-cover rounded"
                    fallbackClassName="w-full h-full rounded"
                  />
                ) : (
                  <Image className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{asset.name}</h4>
                  {isCurrentCover && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-3 h-3" />
                      <span className="text-xs">封面</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{asset.assetType}</p>
              </div>
            </div>
          </div>

          {isCurrentCover && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                ⚠️ 此资产是当前的项目封面，删除后项目将没有封面图片。
              </p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            删除后，此资产文件将被永久删除且无法恢复。请确认您真的要删除这个资产。
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
