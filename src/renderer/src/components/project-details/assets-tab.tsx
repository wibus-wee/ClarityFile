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
import { cn, formatFileSize } from '@renderer/lib/utils'
import { SafeImage } from '@renderer/components/ui/safe-image'
import { AssetFormDrawer } from './drawers/asset-form-drawer'
import { AssetDetailsDialog } from './dialogs/asset-details-dialog'
import { DeleteAssetDialog } from './dialogs/delete-asset-dialog'
import { SetCoverDialog } from './dialogs/set-cover-dialog'
import type { ProjectDetailsOutput } from '../../../../main/types/project-schemas'
import type { ProjectAssetOutput } from '../../../../main/types/asset-schemas'

interface AssetsTabProps {
  projectDetails: ProjectDetailsOutput
}

type ViewMode = 'grid' | 'list'

// 动画配置常量
const ANIMATION_CONFIG = {
  // Spring 动画参数 - 符合 macOS 风格
  spring: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 1
  },
  // 布局动画参数
  layout: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    duration: 0.4
  },
  // 交互动画参数
  hover: {
    y: -2,
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98
  },
  // 进入/退出动画
  fadeIn: {
    opacity: 1,
    scale: 1,
    y: 0,
    x: 0
  },
  fadeOut: {
    opacity: 0,
    scale: 0.95
  }
} as const

export function AssetsTab({ projectDetails }: AssetsTabProps) {
  const { assets, project } = projectDetails
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'created' | 'size'>('created')
  const [filterType, setFilterType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Dialog/Drawer 状态管理
  const [createAssetOpen, setCreateAssetOpen] = useState(false)
  const [editAssetOpen, setEditAssetOpen] = useState(false)
  const [assetDetailsOpen, setAssetDetailsOpen] = useState(false)
  const [deleteAssetOpen, setDeleteAssetOpen] = useState(false)
  const [setCoverOpen, setSetCoverOpen] = useState(false)

  // 当前选中的资产
  const [selectedAsset, setSelectedAsset] = useState<ProjectAssetOutput | null>(null)

  // 获取所有资产类型
  const assetTypes = Array.from(new Set(assets.map((asset) => asset.assetType)))

  // 过滤和排序资产
  const filteredAssets = assets
    .filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const isCurrentCover = (assetId: string) => {
    return project.currentCoverAssetId === assetId
  }

  // 事件处理函数
  const handleViewAsset = (asset: ProjectAssetOutput) => {
    setSelectedAsset(asset)
    setAssetDetailsOpen(true)
  }

  const handleEditAsset = (asset: ProjectAssetOutput) => {
    setSelectedAsset(asset)
    setEditAssetOpen(true)
  }

  const handleDeleteAsset = (asset: ProjectAssetOutput) => {
    setSelectedAsset(asset)
    setDeleteAssetOpen(true)
  }

  const handleSetCover = (asset: ProjectAssetOutput) => {
    setSelectedAsset(asset)
    setSetCoverOpen(true)
  }

  const handleDownloadAsset = (asset: ProjectAssetOutput) => {
    // TODO: 实现下载功能
    console.log('下载资产:', asset.id)
  }

  const handleSuccess = () => {
    // SWR 会自动处理缓存更新，不需要手动刷新页面
    // 各个 mutation hooks 已经配置了正确的缓存重新验证逻辑
  }

  return (
    <div className="space-y-6">
      {/* 头部操作栏 - 现代化设计 */}
      <div className="space-y-4">
        {/* 标题和统计 */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">项目资产</h2>
            <p className="text-sm text-muted-foreground">
              共 {filteredAssets.length} 个资产
              {searchQuery && ` · 搜索 "${searchQuery}"`}
              {filterType !== 'all' && ` · 类型 "${filterType}"`}
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={() => setCreateAssetOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              添加资产
            </Button>
          </motion.div>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索资产名称或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-background/50 border-border/50 focus:bg-background focus:border-border"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px] h-9 bg-background/50 border-border/50">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {assetTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[120px] h-9 bg-background/50 border-border/50">
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

          {/* 视图切换 */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border/30">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'h-8 px-3 rounded-md transition-all border-0',
                  viewMode === 'grid'
                    ? 'bg-background text-foreground shadow-sm border border-border/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  'h-8 px-3 rounded-md transition-all border-0',
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-sm border border-border/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                )}
              >
                <List className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <Separator />

      {/* 资产列表/网格 */}
      <div
        className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'
            : 'space-y-4'
        )}
      >
        {filteredAssets.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{
                  opacity: 0,
                  scale: 0.95
                }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.2,
                  delay: Math.min(index * 0.03, 0.2)
                }}
                className="overflow-hidden"
              >
                {viewMode === 'grid' ? (
                  // 网格视图 - 现代化设计
                  <div
                    className="group h-full flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:bg-card/90 hover:border-border hover:shadow-md transition-all duration-200"
                    onClick={() => handleViewAsset(asset)}
                  >
                    {/* 预览区域 */}
                    <div className="relative aspect-[4/3] bg-muted/40 overflow-hidden">
                      {asset.mimeType?.startsWith('image/') ? (
                        <SafeImage
                          filePath={asset.physicalPath}
                          alt={asset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fallbackClassName="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Image className="w-8 h-8 text-primary/60" />
                          </div>
                        </div>
                      )}

                      {/* 覆盖层 */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

                      {/* 封面标识 */}
                      {isCurrentCover(asset.id) && (
                        <div className="absolute top-3 left-3">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                            <Star className="w-3 h-3 fill-current" />
                            封面
                          </div>
                        </div>
                      )}

                      {/* 操作按钮 */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewAsset(asset)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadAsset(asset)
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              下载文件
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditAsset(asset)
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              编辑信息
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetCover(asset)
                              }}
                            >
                              {isCurrentCover(asset.id) ? (
                                <>
                                  <StarOff className="w-4 h-4 mr-2" />
                                  取消设为封面
                                </>
                              ) : (
                                <>
                                  <Star className="w-4 h-4 mr-2" />
                                  设为项目封面
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAsset(asset)
                              }}
                            >
                              删除资产
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* 信息区域 */}
                    <div className="p-4 space-y-3">
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {asset.name}
                        </h3>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0.5 bg-muted text-muted-foreground border border-border/50"
                          >
                            {asset.assetType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(asset.fileSizeBytes)}
                          </span>
                        </div>
                      </div>

                      {asset.contextDescription && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {asset.contextDescription}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(asset.createdAt).toLocaleDateString('zh-CN')}</span>
                        {asset.versionInfo && (
                          <span className="px-1.5 py-0.5 bg-muted border border-border/50 rounded text-xs">
                            {asset.versionInfo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // 列表视图 - 现代化设计
                  <div
                    className="group flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted/30 hover:border-border transition-all duration-200 cursor-pointer"
                    onClick={() => handleViewAsset(asset)}
                  >
                    {/* 缩略图 */}
                    <div className="relative w-14 h-14 bg-muted/50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                      {asset.mimeType?.startsWith('image/') ? (
                        <SafeImage
                          filePath={asset.physicalPath}
                          alt={asset.name}
                          className="w-full h-full object-cover rounded-xl"
                          fallbackClassName="w-full h-full rounded-xl"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Image className="w-5 h-5 text-primary/60" />
                        </div>
                      )}

                      {isCurrentCover(asset.id) && (
                        <div className="absolute -top-1 -right-1">
                          <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white fill-current" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 主要信息 */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {asset.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-0.5 bg-muted text-muted-foreground border border-border/50 shrink-0"
                        >
                          {asset.assetType}
                        </Badge>
                        {asset.versionInfo && (
                          <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted border border-border/50 rounded shrink-0">
                            {asset.versionInfo}
                          </span>
                        )}
                      </div>

                      {asset.contextDescription && (
                        <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">
                          {asset.contextDescription}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-muted-foreground/40 rounded-full"></span>
                          {formatFileSize(asset.fileSizeBytes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-muted-foreground/40 rounded-full"></span>
                          {new Date(asset.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <span className="w-1 h-1 bg-muted-foreground/40 rounded-full"></span>
                          {asset.originalFileName}
                        </span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadAsset(asset)
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewAsset(asset)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditAsset(asset)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            编辑信息
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSetCover(asset)
                            }}
                          >
                            {isCurrentCover(asset.id) ? (
                              <>
                                <StarOff className="w-4 h-4 mr-2" />
                                取消设为封面
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4 mr-2" />
                                设为项目封面
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAsset(asset)
                            }}
                          >
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={ANIMATION_CONFIG.spring}
            className="col-span-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...ANIMATION_CONFIG.spring, delay: 0.1 }}
              className="text-center py-16 px-6"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted border border-border/50 flex items-center justify-center">
                <Image className="w-10 h-10 text-muted-foreground" />
              </div>

              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {searchQuery || filterType !== 'all' ? '没有找到匹配的资产' : '暂无项目资产'}
              </h3>

              <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                {searchQuery || filterType !== 'all'
                  ? '尝试调整搜索条件或筛选器来查找您需要的资产'
                  : '开始上传图片、文档、视频等资产文件，让您的项目更加丰富'}
              </p>

              {!searchQuery && filterType === 'all' && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={() => setCreateAssetOpen(true)} size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    添加第一个资产
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Dialog 和 Drawer 组件 */}
      <AssetFormDrawer
        projectId={projectDetails.project.id}
        open={createAssetOpen}
        onOpenChange={setCreateAssetOpen}
        onSuccess={handleSuccess}
      />

      <AssetFormDrawer
        projectId={projectDetails.project.id}
        asset={selectedAsset}
        open={editAssetOpen}
        onOpenChange={setEditAssetOpen}
        onSuccess={handleSuccess}
      />

      <AssetDetailsDialog
        asset={selectedAsset}
        open={assetDetailsOpen}
        onOpenChange={setAssetDetailsOpen}
        isCurrentCover={selectedAsset ? isCurrentCover(selectedAsset.id) : false}
      />

      <DeleteAssetDialog
        asset={selectedAsset}
        open={deleteAssetOpen}
        onOpenChange={setDeleteAssetOpen}
        onSuccess={handleSuccess}
        isCurrentCover={selectedAsset ? isCurrentCover(selectedAsset.id) : false}
      />

      <SetCoverDialog
        asset={selectedAsset}
        projectId={projectDetails.project.id}
        open={setCoverOpen}
        onOpenChange={setSetCoverOpen}
        onSuccess={handleSuccess}
        isCurrentCover={selectedAsset ? isCurrentCover(selectedAsset.id) : false}
      />
    </div>
  )
}
