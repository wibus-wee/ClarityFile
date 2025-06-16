import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@clarity/shadcn/ui/button'
import { Input } from '@clarity/shadcn/ui/input'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Separator } from '@clarity/shadcn/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@clarity/shadcn/ui/select'
import {
  Share2,
  Plus,
  Search,
  Filter,
  Calendar,
  FileText,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  Link,
  Unlink
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import { formatFileSize } from '@renderer/lib/utils'
import { ProjectDetailsOutput } from '@main/types/project-schemas'

interface SharedResourcesTabProps {
  projectDetails: ProjectDetailsOutput
}

export function SharedResourcesTab({ projectDetails }: SharedResourcesTabProps) {
  const { sharedResources } = projectDetails
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'associated' | 'created'>('associated')
  const [filterType, setFilterType] = useState<string>('all')

  // 获取所有资源类型
  const resourceTypes = Array.from(
    new Set(sharedResources.map((resource) => resource.resourceType))
  )

  // 过滤和排序共享资源
  const filteredResources = sharedResources
    .filter((resource) => {
      const matchesSearch =
        resource.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.resourceDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.usageDescription?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || resource.resourceType === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.resourceName.localeCompare(b.resourceName)
        case 'type':
          return a.resourceType.localeCompare(b.resourceType)
        case 'associated':
          return new Date(b.associatedAt).getTime() - new Date(a.associatedAt).getTime()
        case 'created':
          return new Date(b.resourceCreatedAt).getTime() - new Date(a.resourceCreatedAt).getTime()
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索共享资源..."
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
              {resourceTypes.map((type) => (
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
              <SelectItem value="associated">关联时间</SelectItem>
              <SelectItem value="created">创建时间</SelectItem>
              <SelectItem value="name">名称</SelectItem>
              <SelectItem value="type">类型</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            关联共享资源
          </Button>
        </div>
      </div>

      <Separator />

      {/* 共享资源列表 */}
      <div className="space-y-4">
        {filteredResources.length > 0 ? (
          <AnimatePresence>
            {filteredResources.map((resource, index) => {
              return (
                <motion.div
                  key={resource.resourceId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-border rounded-lg p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <Share2 className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold truncate">
                            {resource.resourceName}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {resource.resourceType}
                          </Badge>
                        </div>

                        {resource.resourceDescription && (
                          <p className="text-muted-foreground mb-3">
                            {resource.resourceDescription}
                          </p>
                        )}

                        {resource.usageDescription && (
                          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-2">
                              <Link className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                  在此项目中的用途
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                  {resource.usageDescription}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">文件：</span>
                            <span className="truncate">{resource.originalFileName}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">关联时间：</span>
                            <span>{new Date(resource.associatedAt).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">创建时间：</span>
                            <span>{new Date(resource.resourceCreatedAt).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">大小：</span>
                            <span>{formatFileSize(resource.fileSizeBytes)}</span>
                          </div>
                        </div>

                        {resource.resourceCustomFields && (
                          <div className="mt-3 p-3 bg-muted/20 rounded border">
                            <p className="text-sm font-medium mb-2">自定义字段</p>
                            <pre className="text-xs text-muted-foreground overflow-auto">
                              {JSON.stringify(resource.resourceCustomFields, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        下载
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            编辑用途说明
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" />
                            查看所有关联项目
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Unlink className="w-4 h-4 mr-2" />
                            取消关联
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* 额外信息栏 */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>MIME类型：{resource.mimeType || '未知'}</span>
                      <span>上传时间：{new Date(resource.uploadedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        预览
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        打开文件夹
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12">
            <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">暂无关联资源</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterType !== 'all'
                ? '没有找到匹配的共享资源'
                : '开始关联共享资源到此项目'}
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              关联共享资源
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
