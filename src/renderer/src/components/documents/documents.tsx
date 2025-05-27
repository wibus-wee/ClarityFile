import { useState } from 'react'
import { Plus, Search, Filter, Grid, List, FileText } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Badge } from '@renderer/components/ui/badge'
import { Separator } from '@renderer/components/ui/separator'
import { DocumentCard } from './document-card'
import { DocumentDialogs } from './document-dialogs'
import { DocumentEmptyState } from './document-empty-state'
import { DocumentSkeleton } from './document-skeleton'
import { DocumentFilters } from './document-filters'
import { useProjects, useAllDocuments, useCreateLogicalDocument } from '@renderer/hooks/use-tipc'

interface LogicalDocument {
  id: string
  name: string
  type: string
  description?: string
  status: string
  createdAt: string
  updatedAt: string
  projectId: string
}

interface Project {
  id: string
  name: string
}

export function Documents() {
  console.log(1111)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  // 获取所有项目用于筛选
  const { data: projects } = useProjects()

  // 获取所有文档
  const { data: allDocuments, isLoading: documentsLoading, mutate } = useAllDocuments()

  // 创建文档的 mutation
  const { trigger: createDocument } = useCreateLogicalDocument()

  // 获取文档类型
  // const { data: documentTypesData } = useDocumentTypes()

  // 转换文档类型数据格式，暂时使用模拟数据
  const documentTypes = [
    { value: 'business_plan', label: '商业计划书' },
    { value: 'presentation', label: 'PPT演示' },
    { value: 'report', label: '项目报告' },
    { value: 'proposal', label: '项目提案' },
    { value: 'specification', label: '项目说明书' },
    { value: 'manual', label: '使用手册' },
    { value: 'contract', label: '合同协议' },
    { value: 'other', label: '其他文档' }
  ]

  const filteredDocuments =
    (allDocuments as LogicalDocument[])?.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesProject = !selectedProject || doc.projectId === selectedProject
      const matchesType = !selectedType || doc.type === selectedType
      const matchesStatus = !selectedStatus || doc.status === selectedStatus

      return matchesSearch && matchesProject && matchesType && matchesStatus
    }) || []

  const handleCreateDocument = () => {
    setShowCreateDialog(true)
  }

  const handleDocumentCreated = async (data: any) => {
    try {
      await createDocument(data)
      // 如果当前没有选择项目，自动选择新创建文档的项目
      if (!selectedProject && data.projectId) {
        setSelectedProject(data.projectId)
      }
      mutate()
      setShowCreateDialog(false)
    } catch (error) {
      console.error('创建文档失败:', error)
    }
  }

  const activeFiltersCount = [selectedProject, selectedType, selectedStatus].filter(Boolean).length

  return (
    <div className="flex flex-col h-full">
      {/* 页面头部 */}
      <div className="flex flex-col gap-4 p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">文档库</h1>
              <p className="text-sm text-muted-foreground">管理项目文档和版本历史</p>
            </div>
          </div>
          <Button onClick={handleCreateDocument} className="gap-2">
            <Plus className="w-4 h-4" />
            新建文档
          </Button>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索文档名称或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="w-4 h-4" />
            筛选
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 筛选面板 */}
        {showFilters && (
          <DocumentFilters
            projects={(projects as Project[]) || []}
            documentTypes={documentTypes || []}
            selectedProject={selectedProject}
            selectedType={selectedType}
            selectedStatus={selectedStatus}
            onProjectChange={setSelectedProject}
            onTypeChange={setSelectedType}
            onStatusChange={setSelectedStatus}
            onReset={() => {
              setSelectedProject('')
              setSelectedType('')
              setSelectedStatus('')
            }}
          />
        )}
      </div>

      {/* 文档列表 */}
      <div className="flex-1 p-6">
        {documentsLoading ? (
          <div
            className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <DocumentSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <DocumentEmptyState
            hasFilters={activeFiltersCount > 0}
            onCreateDocument={handleCreateDocument}
            onClearFilters={() => {
              setSelectedProject('')
              setSelectedType('')
              setSelectedStatus('')
              setSearchQuery('')
            }}
          />
        ) : (
          <div
            className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                viewMode={viewMode}
                onUpdate={mutate}
              />
            ))}
          </div>
        )}
      </div>

      {/* 对话框 */}
      <DocumentDialogs
        showCreateDialog={showCreateDialog}
        onCreateDialogChange={setShowCreateDialog}
        onDocumentCreated={handleDocumentCreated}
        projects={(projects as Project[]) || []}
        documentTypes={documentTypes || []}
      />
    </div>
  )
}
