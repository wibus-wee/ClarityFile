import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@clarity/shadcn/ui/button'
import { Input } from '@clarity/shadcn/ui/input'
import { Badge } from '@clarity/shadcn/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@clarity/shadcn/ui/select'
import { FileText, Search, Filter, Calendar, Eye, MoreHorizontal, Tag, Trophy } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useQuickLookPreviewById, useIsQuickLookAvailable } from '@renderer/hooks/use-tipc'
import type { CompetitionDocumentOutput } from '../../../../main/types/competition-schemas'

interface CompetitionDocumentsSectionProps {
  documents: CompetitionDocumentOutput[]
  competitionName: string
  levelName: string
}

export function CompetitionDocumentsSection({
  documents,
  competitionName,
  levelName
}: CompetitionDocumentsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'created' | 'version'>('created')

  const { trigger: previewFile } = useQuickLookPreviewById()
  const { data: isQuickLookAvailable } = useIsQuickLookAvailable()

  // 获取所有文档类型
  const documentTypes = Array.from(new Set(documents.map((doc) => doc.documentType)))

  // 过滤和排序文档
  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch =
        doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.versionTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentDescription?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || doc.documentType === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.documentName.localeCompare(b.documentName)
        case 'type':
          return a.documentType.localeCompare(b.documentType)
        case 'created':
          return new Date(b.versionCreatedAt).getTime() - new Date(a.versionCreatedAt).getTime()
        case 'version':
          return a.versionTag.localeCompare(b.versionTag)
        default:
          return 0
      }
    })

  const handlePreview = async (document: CompetitionDocumentOutput) => {
    if (isQuickLookAvailable?.available) {
      try {
        await previewFile({ fileId: document.managedFileId })
      } catch (error) {
        console.error('预览文件失败:', error)
      }
    }
  }

  const handleViewDetails = (document: CompetitionDocumentOutput) => {
    // TODO: 实现查看文档详情功能
    console.log('查看文档详情:', document)
  }

  if (documents.length === 0) {
    return (
      <div className="space-y-4">
        {/* 比赛信息标题 */}
        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
          <Trophy className="w-4 h-4 text-primary" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">{competitionName}</span>
            <span className="text-muted-foreground">·</span>
            <Badge variant="outline" className="text-xs">
              {levelName}
            </Badge>
          </div>
        </div>

        <div className="py-8 text-center">
          <FileText className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">此比赛暂无关联文档</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 比赛信息标题 */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
        <Trophy className="w-4 h-4 text-primary" />
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-foreground">{competitionName}</span>
          <span className="text-muted-foreground">·</span>
          <Badge variant="outline" className="text-xs">
            {levelName}
          </Badge>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{documents.length} 个文档</span>
        </div>
      </div>

      {/* 文档筛选工具栏 */}
      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/30">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索文档..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-8"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-28 h-8">
            <Filter className="w-3 h-3 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            {documentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-24 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">最新</SelectItem>
            <SelectItem value="name">名称</SelectItem>
            <SelectItem value="type">类型</SelectItem>
            <SelectItem value="version">版本</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 文档列表 */}
      <div className="space-y-2 p-2 bg-background/50 rounded-lg border border-border/20">
        <AnimatePresence>
          {filteredDocuments.map((document, index) => (
            <motion.div
              key={document.versionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.02 }}
              className="group flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:border-border hover:bg-muted/30 transition-all duration-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{document.documentName}</h4>
                    <Badge variant="outline" className="text-xs">
                      {document.documentType}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {document.versionTag}
                    </Badge>
                    {document.isGenericVersion ? (
                      <Badge
                        variant="default"
                        className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        通用版本
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        比赛版本
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(document.versionCreatedAt), {
                        addSuffix: true,
                        locale: zhCN
                      })}
                    </span>
                    {document.versionNotes && (
                      <span className="truncate max-w-48">{document.versionNotes}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isQuickLookAvailable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handlePreview(document)}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isQuickLookAvailable && (
                      <DropdownMenuItem onClick={() => handlePreview(document)}>
                        <Eye className="w-4 h-4 mr-2" />
                        预览
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleViewDetails(document)}>
                      <FileText className="w-4 h-4 mr-2" />
                      查看详情
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredDocuments.length === 0 && (searchQuery || filterType !== 'all') && (
        <div className="py-8 text-center">
          <FileText className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">没有找到匹配的文档</p>
        </div>
      )}
    </div>
  )
}
