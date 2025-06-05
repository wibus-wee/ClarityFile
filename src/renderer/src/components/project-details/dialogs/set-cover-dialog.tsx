import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { SafeImage } from '@renderer/components/ui/safe-image'
import { Star, StarOff, Image } from 'lucide-react'
import { useUpdateProject } from '@renderer/hooks/use-tipc'

interface SetCoverDialogProps {
  asset: any | null // 使用 ProjectDetailsOutput['assets'][0] 类型
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  isCurrentCover?: boolean
}

export function SetCoverDialog({
  asset,
  projectId,
  open,
  onOpenChange,
  onSuccess,
  isCurrentCover = false
}: SetCoverDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const updateProject = useUpdateProject()

  const handleSetCover = async () => {
    if (!asset) return

    setIsUpdating(true)
    try {
      await updateProject.trigger({
        id: projectId,
        currentCoverAssetId: isCurrentCover ? null : asset.id
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('设置封面失败:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!asset) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCurrentCover ? (
              <>
                <StarOff className="w-5 h-5 text-yellow-500" />
                取消设为封面
              </>
            ) : (
              <>
                <Star className="w-5 h-5 text-yellow-500" />
                设为项目封面
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCurrentCover ? '确认要取消此资产作为项目封面吗？' : '确认要将此资产设为项目封面吗？'}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-muted/20 rounded flex items-center justify-center shrink-0 overflow-hidden">
                {asset.mimeType?.startsWith('image/') ? (
                  <SafeImage
                    filePath={asset.physicalPath}
                    alt={asset.name}
                    className="w-full h-full object-cover rounded"
                    fallbackClassName="w-full h-full rounded"
                  />
                ) : (
                  <Image className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{asset.name}</h4>
                <p className="text-sm text-muted-foreground">{asset.assetType}</p>
                {asset.contextDescription && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {asset.contextDescription}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {isCurrentCover ? (
              <p>取消后，项目将没有封面图片，您可以随时重新设置其他资产作为封面。</p>
            ) : (
              <p>设置后，此资产将作为项目的封面图片显示在项目列表和详情页面中。</p>
            )}
          </div>
        </motion.div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            取消
          </Button>
          <Button onClick={handleSetCover} disabled={isUpdating}>
            {isUpdating
              ? isCurrentCover
                ? '取消中...'
                : '设置中...'
              : isCurrentCover
                ? '确认取消'
                : '确认设置'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
