import { useState } from 'react'
import {
  Clock,
  Download,
  Eye,
  MoreHorizontal,
  Star,
  Upload,
  FileText,
  Calendar
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { cn } from '@renderer/lib/utils'
import { motion } from 'framer-motion'

interface DocumentVersion {
  id: string
  versionTag: string
  fileName: string
  fileSize: number
  createdAt: string
  isGenericVersion: boolean
  competitionProjectName?: string
  notes?: string
  isCurrentOfficial?: boolean
}

interface DocumentVersionListProps {
  versions: DocumentVersion[]
  onVersionSelect?: (version: DocumentVersion) => void
  onVersionDownload?: (version: DocumentVersion) => void
  onVersionPreview?: (version: DocumentVersion) => void
  onSetOfficial?: (version: DocumentVersion) => void
  onAddVersion?: () => void
  onUpdate?: () => void
}

export function DocumentVersionList({
  versions,
  onVersionSelect,
  onVersionDownload,
  onVersionPreview,
  onSetOfficial,
  onAddVersion
}: DocumentVersionListProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getVersionTypeColor = (version: DocumentVersion) => {
    if (version.isCurrentOfficial) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    }
    if (version.isGenericVersion) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    }
    if (version.competitionProjectName) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  const getVersionTypeText = (version: DocumentVersion) => {
    if (version.isCurrentOfficial) return '当前官方版本'
    if (version.isGenericVersion) return '通用版本'
    if (version.competitionProjectName) return `比赛版本: ${version.competitionProjectName}`
    return '普通版本'
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">还没有任何版本</h3>
        <p className="text-muted-foreground mb-6">上传第一个文件版本开始管理文档历史</p>
        {onAddVersion && (
          <Button onClick={onAddVersion} className="gap-2">
            <Upload className="w-4 h-4" />
            上传版本
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">共 {versions.length} 个版本</span>
        </div>
        {onAddVersion && (
          <Button onClick={onAddVersion} size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            添加版本
          </Button>
        )}
      </div>

      {/* 版本列表 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>版本标签</TableHead>
              <TableHead>文件名</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>大小</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>备注</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((version, index) => (
              <motion.tr
                key={version.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  'cursor-pointer hover:bg-muted/50 transition-colors',
                  selectedVersion === version.id && 'bg-muted'
                )}
                onClick={() => {
                  setSelectedVersion(version.id)
                  onVersionSelect?.(version)
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {version.isCurrentOfficial && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <span className="font-medium">{version.versionTag}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate max-w-[200px]" title={version.fileName}>
                      {version.fileName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn('text-xs', getVersionTypeColor(version))}>
                    {getVersionTypeText(version)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatFileSize(version.fileSize)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(version.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  {version.notes && (
                    <span
                      className="text-sm text-muted-foreground truncate max-w-[150px]"
                      title={version.notes}
                    >
                      {version.notes}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onVersionPreview?.(version)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onVersionDownload?.(version)}>
                          <Download className="w-4 h-4 mr-2" />
                          下载
                        </DropdownMenuItem>
                        {!version.isCurrentOfficial && onSetOfficial && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onSetOfficial(version)}>
                              <Star className="w-4 h-4 mr-2" />
                              设为官方版本
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
