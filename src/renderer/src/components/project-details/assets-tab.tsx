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
import { SafeImage } from '@renderer/components/ui/safe-image'
import { CreateAssetDrawer } from './drawers/create-asset-drawer'
import { EditAssetDrawer } from './drawers/edit-asset-drawer'
import { AssetDetailsDialog } from './dialogs/asset-details-dialog'
import { DeleteAssetDialog } from './dialogs/delete-asset-dialog'
import { SetCoverDialog } from './dialogs/set-cover-dialog'
import type { ProjectDetailsOutput } from '../../../../main/types/outputs'

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
  const [selectedAsset, setSelectedAsset] = useState<any>(null)

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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '未知大小'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isCurrentCover = (assetId: string) => {
    return project.currentCoverAssetId === assetId
  }

  // 事件处理函数
  const handleViewAsset = (asset: any) => {
    setSelectedAsset(asset)
    setAssetDetailsOpen(true)
  }

  const handleEditAsset = (asset: any) => {
    setSelectedAsset(asset)
    setEditAssetOpen(true)
  }

  const handleDeleteAsset = (asset: any) => {
    setSelectedAsset(asset)
    setDeleteAssetOpen(true)
  }

  const handleSetCover = (asset: any) => {
    setSelectedAsset(asset)
    setSetCoverOpen(true)
  }

  const handleDownloadAsset = (asset: any) => {
    // TODO: 实现下载功能
    console.log('下载资产:', asset.id)
  }

  const handleSuccess = () => {
    // SWR 会自动处理缓存更新，不需要手动刷新页面
    // 各个 mutation hooks 已经配置了正确的缓存重新验证逻辑
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
              {assetTypes.map((type) => (
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
              <SelectItem value="created">最新创建</SelectItem>
              <SelectItem value="name">名称</SelectItem>
              <SelectItem value="type">类型</SelectItem>
              <SelectItem value="size">文件大小</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setCreateAssetOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              添加新资产
            </Button>
          </motion.div>
        </div>
      </div>

      <Separator />

      {/* 资产列表/网格 */}
      <motion.div
        layout
        layoutId="assets-container"
        transition={ANIMATION_CONFIG.layout}
        className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
        )}
      >
        {filteredAssets.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                layout
                layoutId={`asset-${asset.id}`}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  ...(viewMode === 'grid' ? { y: 20 } : { x: -20 })
                }}
                animate={ANIMATION_CONFIG.fadeIn}
                exit={ANIMATION_CONFIG.fadeOut}
                whileHover={ANIMATION_CONFIG.hover}
                whileTap={ANIMATION_CONFIG.tap}
                transition={{
                  ...ANIMATION_CONFIG.spring,
                  delay: Math.min(index * 0.05, 0.3), // 限制最大延迟
                  layout: ANIMATION_CONFIG.layout
                }}
                className={cn(
                  'border border-border rounded-lg overflow-hidden cursor-pointer',
                  'hover:shadow-lg hover:border-primary/20 transition-shadow duration-200',
                  viewMode === 'grid' ? 'aspect-square' : 'h-auto'
                )}
              >
                {viewMode === 'grid' ? (
                  // 网格视图
                  <div className="h-full flex flex-col">
                    <div className="flex-1 bg-muted/20 flex items-center justify-center relative overflow-hidden">
                      {asset.mimeType?.startsWith('image/') ? (
                        <SafeImage
                          filePath={asset.physicalPath}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                          fallbackClassName="w-full h-full"
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
                            <DropdownMenuItem onClick={() => handleViewAsset(asset)}>
                              <Eye className="w-4 h-4 mr-2" />
                              查看
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadAsset(asset)}>
                              <Download className="w-4 h-4 mr-2" />
                              下载
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditAsset(asset)}>
                              <Edit className="w-4 h-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSetCover(asset)}>
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
                              className="text-destructive"
                              onClick={() => handleDeleteAsset(asset)}
                            >
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
                    <div className="w-12 h-12 bg-muted/20 rounded flex items-center justify-center shrink-0 overflow-hidden">
                      {asset.mimeType?.startsWith('image/') ? (
                        <SafeImage
                          filePath={asset.physicalPath}
                          alt={asset.name}
                          className="w-full h-full object-cover rounded"
                          fallbackClassName="w-full h-full rounded"
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
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadAsset(asset)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleViewAsset(asset)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditAsset(asset)}>
                            <Edit className="w-4 h-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleSetCover(asset)}>
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
                            className="text-destructive"
                            onClick={() => handleDeleteAsset(asset)}
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
            className="col-span-full text-center py-12"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...ANIMATION_CONFIG.spring, delay: 0.1 }}
            >
              <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">暂无资产</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterType !== 'all' ? '没有找到匹配的资产' : '开始添加项目资产'}
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => setCreateAssetOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加新资产
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Dialog 和 Drawer 组件 */}
      <CreateAssetDrawer
        projectId={projectDetails.id}
        open={createAssetOpen}
        onOpenChange={setCreateAssetOpen}
        onSuccess={handleSuccess}
      />

      <EditAssetDrawer
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
        projectId={projectDetails.id}
        open={setCoverOpen}
        onOpenChange={setSetCoverOpen}
        onSuccess={handleSuccess}
        isCurrentCover={selectedAsset ? isCurrentCover(selectedAsset.id) : false}
      />
    </div>
  )
}
