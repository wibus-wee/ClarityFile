import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Badge } from '@renderer/components/ui/badge'
import { Separator } from '@renderer/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@renderer/components/ui/collapsible'
import {
  FileText,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { DocumentDrawer } from './drawers/document-drawer'
import { DocumentVersionFormDrawer } from './drawers/document-version-form-drawer'
import { DocumentDetailsDialog } from './dialogs/document-details-dialog'
import { DeleteDocumentDialog } from './dialogs/delete-document-dialog'
import { DocumentVersionDetailsDialog } from './dialogs/document-version-details-dialog'
import { DeleteDocumentVersionDialog } from './dialogs/delete-document-version-dialog'
import type { ProjectDetailsOutput } from '../../../../main/types/project-schemas'
import type {
  LogicalDocumentWithVersionsOutput,
  DocumentVersionOutput
} from '../../../../main/types/document-schemas'

interface DocumentsTabProps {
  projectDetails: ProjectDetailsOutput
}

export function DocumentsTab({ projectDetails }: DocumentsTabProps) {
  const { documents } = projectDetails
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'created' | 'updated'>('updated')
  const [filterType, setFilterType] = useState<string>('all')
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set())

  // Dialog/Drawer 状态管理
  const [createDocumentOpen, setCreateDocumentOpen] = useState(false)
  const [editDocumentOpen, setEditDocumentOpen] = useState(false)
  const [versionFormOpen, setVersionFormOpen] = useState(false)
  const [versionFormMode, setVersionFormMode] = useState<'create' | 'edit'>('create')
  const [documentDetailsOpen, setDocumentDetailsOpen] = useState(false)
  const [deleteDocumentOpen, setDeleteDocumentOpen] = useState(false)
  const [versionDetailsOpen, setVersionDetailsOpen] = useState(false)
  const [deleteVersionOpen, setDeleteVersionOpen] = useState(false)

  // 当前选中的文档和版本
  const [selectedDocument, setSelectedDocument] =
    useState<LogicalDocumentWithVersionsOutput | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersionOutput | null>(null)

  // 获取所有文档类型
  const documentTypes = Array.from(new Set(documents.map((doc) => doc.type)))

  // 过滤和排序文档
  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || doc.type === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'type':
          return a.type.localeCompare(b.type)
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default:
          return 0
      }
    })

  const toggleDocExpansion = (docId: string) => {
    const newExpanded = new Set(expandedDocs)
    if (newExpanded.has(docId)) {
      newExpanded.delete(docId)
    } else {
      newExpanded.add(docId)
    }
    setExpandedDocs(newExpanded)
  }

  // 事件处理函数
  const handleEditDocument = (document: LogicalDocumentWithVersionsOutput) => {
    setSelectedDocument(document)
    setEditDocumentOpen(true)
  }

  const handleViewDocumentDetails = (document: LogicalDocumentWithVersionsOutput) => {
    setSelectedDocument(document)
    setDocumentDetailsOpen(true)
  }

  const handleDeleteDocument = (document: LogicalDocumentWithVersionsOutput) => {
    setSelectedDocument(document)
    setDeleteDocumentOpen(true)
  }

  const handleAddVersion = (document: LogicalDocumentWithVersionsOutput) => {
    setSelectedDocument(document)
    setSelectedVersion(null)
    setVersionFormMode('create')
    setVersionFormOpen(true)
  }

  const handleEditVersion = (
    document: LogicalDocumentWithVersionsOutput,
    version: DocumentVersionOutput
  ) => {
    setSelectedDocument(document)
    setSelectedVersion(version)
    setVersionFormMode('edit')
    setVersionFormOpen(true)
  }

  const handleDeleteVersion = (version: DocumentVersionOutput) => {
    setSelectedVersion(version)
    setDeleteVersionOpen(true)
  }

  const handleViewVersionDetails = (version: DocumentVersionOutput) => {
    setSelectedVersion(version)
    setVersionDetailsOpen(true)
  }

  const handleDownloadVersion = (version: DocumentVersionOutput) => {
    // TODO: 实现下载功能
    console.log('下载版本:', version.id)
  }

  const handleSuccess = () => {
    // SWR 会自动处理缓存更新，不需要手动刷新页面
    // 各个 mutation hooks 已经配置了正确的缓存重新验证逻辑
  }

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
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索文档..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
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
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">最近更新</SelectItem>
              <SelectItem value="created">创建时间</SelectItem>
              <SelectItem value="name">名称</SelectItem>
              <SelectItem value="type">类型</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateDocumentOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            添加新逻辑文档
          </Button>
        </div>
      </div>

      <Separator />

      {/* 文档列表 */}
      <div className="space-y-4">
        {filteredDocuments.length > 0 ? (
          <AnimatePresence>
            {filteredDocuments.map((document, index) => {
              const isExpanded = expandedDocs.has(document.id)

              return (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleDocExpansion(document.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <FileText className="w-5 h-5 text-primary" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">{document.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {document.type}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(document.status)}`}>
                                {document.status}
                              </Badge>
                            </div>
                            {document.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {document.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span>版本数：{document.versions.length}</span>
                              <span>创建：{new Date(document.createdAt).toLocaleDateString()}</span>
                              <span>更新：{new Date(document.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddVersion(document)
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            添加版本
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditDocument(document)}>
                                <Edit className="w-4 h-4 mr-2" />
                                编辑文档
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewDocumentDetails(document)}>
                                <Eye className="w-4 h-4 mr-2" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteDocument(document)}
                              >
                                删除文档
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t border-border bg-muted/20">
                        {document.versions.length > 0 ? (
                          <div className="p-4 space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground">
                              文档版本 ({document.versions.length})
                            </h4>
                            <div className="space-y-2">
                              {document.versions.map((version: DocumentVersionOutput) => {
                                const isOfficialVersion =
                                  document.currentOfficialVersionId === version.id

                                return (
                                  <div
                                    key={version.id}
                                    className="flex items-center justify-between p-3 bg-background rounded border"
                                  >
                                    <div className="flex items-center gap-3">
                                      <FileText className="w-4 h-4 text-muted-foreground" />
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">
                                            {version.versionTag}
                                          </span>
                                          {version.isGenericVersion && (
                                            <Badge variant="secondary" className="text-xs">
                                              通用版本
                                            </Badge>
                                          )}
                                          {isOfficialVersion && (
                                            <Badge variant="default" className="text-xs">
                                              官方版本
                                            </Badge>
                                          )}
                                          {version.competitionMilestone && (
                                            <Badge variant="outline" className="text-xs">
                                              {version.competitionMilestone.series.name} -{' '}
                                              {version.competitionMilestone.levelName}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                          <span>{version.originalFileName}</span>
                                          <span>
                                            {new Date(version.createdAt).toLocaleDateString()}
                                          </span>
                                          {version.fileSizeBytes && (
                                            <span>
                                              {(version.fileSizeBytes / 1024).toFixed(1)} KB
                                            </span>
                                          )}
                                        </div>
                                        {version.notes && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {version.notes}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDownloadVersion(version)}
                                      >
                                        <Download className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewVersionDetails(version)}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>

                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="w-4 h-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() => handleEditVersion(document, version)}
                                          >
                                            <Edit className="w-4 h-4 mr-2" />
                                            编辑版本
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => handleDeleteVersion(version)}
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            删除版本
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">暂无文档版本</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleAddVersion(document)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              添加第一个版本
                            </Button>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              )
            })}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">暂无文档</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterType !== 'all' ? '没有找到匹配的文档' : '开始添加项目文档'}
            </p>
            <Button onClick={() => setCreateDocumentOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              添加新逻辑文档
            </Button>
          </div>
        )}
      </div>

      {/* Dialog 和 Drawer 组件 */}
      <DocumentDrawer
        projectId={projectDetails.project.id}
        open={createDocumentOpen || editDocumentOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDocumentOpen(false)
            setEditDocumentOpen(false)
            setSelectedDocument(null)
          }
        }}
        document={selectedDocument}
        onSuccess={handleSuccess}
      />

      <DocumentVersionFormDrawer
        mode={versionFormMode}
        document={selectedDocument}
        version={versionFormMode === 'edit' ? selectedVersion : null}
        projectDetails={projectDetails}
        open={versionFormOpen}
        onOpenChange={setVersionFormOpen}
        onSuccess={handleSuccess}
      />

      <DocumentDetailsDialog
        document={selectedDocument}
        open={documentDetailsOpen}
        onOpenChange={setDocumentDetailsOpen}
      />

      <DeleteDocumentDialog
        document={selectedDocument}
        open={deleteDocumentOpen}
        onOpenChange={setDeleteDocumentOpen}
        onSuccess={handleSuccess}
      />

      <DocumentVersionDetailsDialog
        version={selectedVersion}
        open={versionDetailsOpen}
        onOpenChange={setVersionDetailsOpen}
      />

      <DeleteDocumentVersionDialog
        version={selectedVersion}
        isOfficialVersion={selectedDocument?.currentOfficialVersionId === selectedVersion?.id}
        open={deleteVersionOpen}
        onOpenChange={setDeleteVersionOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
