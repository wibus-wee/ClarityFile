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
  Image, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3,
  List,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  Star,
  StarOff
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { cn } from '@renderer/lib/utils'
import type { ProjectDetailsOutput } from '../../../../main/types/outputs'

interface AssetsTabProps {
  projectDetails: ProjectDetailsOutput
}

type ViewMode = 'grid' | 'list'

export function AssetsTab({ projectDetails }: AssetsTabProps) {
  const { assets, project } = projectDetails
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'created' | 'size'>('created')
  const [filterType, setFilterType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // 获取所有资产类型
  const assetTypes = Array.from(new Set(assets.map(asset => asset.assetType)))

  // 过滤和排序资产
  const filteredAssets = assets
    .filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           asset.contextDescription?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || asset.assetType === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'type':
          return a.assetType.localeCompare(b.assetType)
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'size':
          return (b.fileSizeBytes || 0) - (a.fileSizeBytes || 0)
        default:
          return 0
      }
    })

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '未知大小'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isCurrentCover = (assetId: string) => {
    return project.currentCoverAssetId === assetId
  }

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索资产..."
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
              {assetTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">最新创建</SelectItem>
              <SelectItem value="name">名称</SelectItem>
              <SelectItem value="type">类型</SelectItem>
              <SelectItem value="size">文件大小</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            添加新资产
          </Button>
        </div>
      </div>

      <Separator />

      {/* 资产列表/网格 */}
      <motion.div
        layout
        className={cn(
          'transition-all duration-300',
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
        )}
      >
        {filteredAssets.length > 0 ? (
          <AnimatePresence>
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  delay: index * 0.05,
                  layout: { duration: 0.3 }
                }}
                className={cn(
                  'border border-border rounded-lg overflow-hidden hover:shadow-md transition-all',
                  viewMode === 'grid' ? 'aspect-square' : 'h-auto'
                )}
              >
                {viewMode === 'grid' ? (
                  // 网格视图
                  <div className="h-full flex flex-col">
                    <div className="flex-1 bg-muted/20 flex items-center justify-center relative">
                      {asset.mimeType?.startsWith('image/') ? (
                        <img
                          src={`file://${asset.physicalPath}`}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="w-12 h-12 text-muted-foreground" />
                      )}
                      
                      {isCurrentCover(asset.id) && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-yellow-500 text-yellow-50">
                            <Star className="w-3 h-3 mr-1" />
                            封面
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm truncate flex-1">{asset.name}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              查看
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              下载
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {isCurrentCover(asset.id) ? (
                              <DropdownMenuItem>
                                <StarOff className="w-4 h-4 mr-2" />
                                取消设为封面
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <Star className="w-4 h-4 mr-2" />
                                设为项目封面
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              删除资产
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {asset.assetType}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(asset.fileSizeBytes)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 列表视图
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 bg-muted/20 rounded flex items-center justify-center shrink-0">
                      {asset.mimeType?.startsWith('image/') ? (
                        <img
                          src={`file://${asset.physicalPath}`}
                          alt={asset.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Image className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{asset.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {asset.assetType}
                        </Badge>
                        {isCurrentCover(asset.id) && (
                          <Badge className="bg-yellow-500 text-yellow-50 text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            封面
                          </Badge>
                        )}
                      </div>
                      {asset.contextDescription && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                          {asset.contextDescription}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatFileSize(asset.fileSizeBytes)}</span>
                        <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                        <span>{asset.originalFileName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {isCurrentCover(asset.id) ? (
                            <DropdownMenuItem>
                              <StarOff className="w-4 h-4 mr-2" />
                              取消设为封面
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <Star className="w-4 h-4 mr-2" />
                              设为项目封面
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            删除资产
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full text-center py-12">
            <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">暂无资产</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterType !== 'all' ? '没有找到匹配的资产' : '开始添加项目资产'}
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加新资产
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
