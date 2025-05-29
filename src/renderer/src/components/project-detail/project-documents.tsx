import { useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Badge } from '@renderer/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Plus, Search, FileText, Calendar, User, ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectDocuments, useCreateLogicalDocument } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'

interface ProjectDocumentsProps {
  projectId: string
}

export function ProjectDocuments({ projectId }: ProjectDocumentsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set())
  const [isCreating, setIsCreating] = useState(false)

  const { data: documents, error, isLoading } = useProjectDocuments(projectId)
  const { trigger: createDocument, isMutating: isCreatingDocument } = useCreateLogicalDocument()

  const documentTypes = [
    { value: 'all', label: '全部类型' },
    { value: 'business_plan', label: '商业计划书' },
    { value: 'presentation', label: 'PPT系列' },
    { value: 'report', label: '报告' },
    { value: 'proposal', label: '提案' },
    { value: 'specification', label: '规格说明' },
    { value: 'manual', label: '手册' },
    { value: 'contract', label: '合同' },
    { value: 'other', label: '其他' }
  ]

  const toggleDocumentExpansion = (documentId: string) => {
    const newExpanded = new Set(expandedDocuments)
    if (newExpanded.has(documentId)) {
      newExpanded.delete(documentId)
    } else {
      newExpanded.add(documentId)
    }
    setExpandedDocuments(newExpanded)
  }

  const handleCreateDocument = async () => {
    try {
      await createDocument({
        projectId,
        name: '新建逻辑文档',
        type: 'other',
        description: '请编辑文档信息'
      })
      toast.success('逻辑文档创建成功！')
      setIsCreating(false)
    } catch (error) {
      toast.error('创建逻辑文档失败')
      console.error(error)
    }
  }

  const filteredDocuments = documents?.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || doc.type === typeFilter
    return matchesSearch && matchesType
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="w-48 h-4 bg-muted rounded animate-pulse" />
                <div className="w-32 h-3 bg-muted rounded animate-pulse" />
                <div className="w-64 h-3 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-red-500 mb-2">加载文档失败</div>
        <p className="text-sm text-muted-foreground">请检查网络连接或稍后重试</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索文档..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreateDocument} disabled={isCreatingDocument}>
          <Plus className="w-4 h-4 mr-2" />
          添加新逻辑文档
        </Button>
      </div>

      {/* 文档列表 */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredDocuments && filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleDocumentExpansion(document.id)}
                        >
                          {expandedDocuments.has(document.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{document.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{document.type}</Badge>
                            <Badge variant="outline">{document.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(document.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {document.description && (
                    <CardContent className="pt-0 pb-3">
                      <p className="text-sm text-muted-foreground">{document.description}</p>
                    </CardContent>
                  )}
                  
                  {/* 展开的文档版本列表 */}
                  <AnimatePresence>
                    {expandedDocuments.has(document.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="pt-0 border-t">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">文档版本</h4>
                              <Button variant="outline" size="sm">
                                <Plus className="w-3 h-3 mr-1" />
                                添加版本
                              </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              暂无版本记录
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无文档</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || typeFilter !== 'all'
                  ? '没有找到匹配的文档'
                  : '开始创建您的第一个逻辑文档'}
              </p>
              <Button onClick={handleCreateDocument} disabled={isCreatingDocument}>
                <Plus className="w-4 h-4 mr-2" />
                添加新逻辑文档
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
