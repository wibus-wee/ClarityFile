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
import { SafeImage } from '@renderer/components/ui/safe-image'
import { formatFileSize } from '@renderer/lib/utils'
import { Image, Calendar, Download, HardDrive, FileType, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AssetDetailsDialogProps {
  asset: any | null // 使用 ProjectDetailsOutput['assets'][0] 类型
  open: boolean
  onOpenChange: (open: boolean) => void
  isCurrentCover?: boolean
}

export function AssetDetailsDialog({
  asset,
  open,
  onOpenChange,
  isCurrentCover = false
}: AssetDetailsDialogProps) {
  const { t } = useTranslation('projects')

  const handleDownload = () => {
    if (!asset) return
    // TODO: 实现下载功能
    console.log('下载资产:', asset.id)
  }

  if (!asset) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            {asset.name}
            {isCurrentCover && (
              <Badge className="bg-yellow-500 text-yellow-50">
                <Star className="w-3 h-3 mr-1" />
                {t('dialogs.assetDetails.projectCover')}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>{t('dialogs.assetDetails.title')}</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 预览区域 */}
          <div className="aspect-video bg-muted/20 rounded-lg flex items-center justify-center overflow-hidden">
            {asset.mimeType?.startsWith('image/') ? (
              <SafeImage
                filePath={asset.physicalPath}
                alt={asset.name}
                className="w-full h-full object-contain"
                fallbackClassName="w-full h-full"
              />
            ) : (
              <div className="text-center">
                <Image className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t('dialogs.assetDetails.noPreview')}
                </p>
              </div>
            )}
          </div>

          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{asset.assetType}</Badge>
              {asset.versionInfo && <Badge variant="secondary">{asset.versionInfo}</Badge>}
            </div>

            {asset.contextDescription && (
              <div>
                <h4 className="text-sm font-medium mb-2">描述</h4>
                <p className="text-sm text-muted-foreground">{asset.contextDescription}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileType className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">文件名：</span>
                <span className="font-mono">{asset.originalFileName}</span>
              </div>

              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">文件大小：</span>
                <span>{formatFileSize(asset.fileSizeBytes)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">创建时间：</span>
                <span>{new Date(asset.createdAt).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t('dialogs.assetDetails.updatedAt')}：
                </span>
                <span>{new Date(asset.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            {asset.mimeType && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t('dialogs.assetDetails.fileInfo')}</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    {t('dialogs.assetDetails.mimeType')}：{asset.mimeType}
                  </div>
                  <div>
                    {t('dialogs.assetDetails.physicalPath')}：
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {asset.physicalPath}
                    </code>
                  </div>
                  <div>
                    {t('dialogs.assetDetails.uploadedAt')}：
                    {new Date(asset.uploadedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {asset.customFields && Object.keys(asset.customFields).length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">自定义字段</h4>
                  <div className="text-sm text-muted-foreground">
                    <pre className="bg-muted/50 p-3 rounded-lg text-xs overflow-auto">
                      {JSON.stringify(asset.customFields, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* 操作按钮 */}
          <div className="flex justify-end">
            <Button onClick={handleDownload} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              {t('dialogs.assetDetails.download')}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
