import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Separator } from '@renderer/components/ui/separator'
import { SafeImage } from '@renderer/components/ui/safe-image'
import { Image, Calendar, Download, HardDrive, FileType, Star } from 'lucide-react'

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
  const handleDownload = () => {
    if (!asset) return
    // TODO: 实现下载功能
    console.log('下载资产:', asset.id)
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '未知大小'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
                项目封面
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>查看资产的详细信息</DialogDescription>
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
                <p className="text-sm text-muted-foreground">无法预览此文件类型</p>
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
                <span className="text-muted-foreground">更新时间：</span>
                <span>{new Date(asset.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            {asset.mimeType && (
              <div>
                <h4 className="text-sm font-medium mb-2">文件信息</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>MIME 类型：{asset.mimeType}</div>
                  <div>
                    物理路径：
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {asset.physicalPath}
                    </code>
                  </div>
                  <div>上传时间：{new Date(asset.uploadedAt).toLocaleString()}</div>
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
              下载文件
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
