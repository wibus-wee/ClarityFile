import { useState } from 'react'
import {
  Sparkles,
  Search,
  FileText,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Heart,
  Star,
  Coffee
} from 'lucide-react'
import { PluginContext } from '../plugin-context'
import {
  DetailLayout,
  DetailSidebar,
  DetailMain,
  DetailSection,
  DetailItem,
  DetailInput,
  DetailButton,
  DetailStatus,
  DetailLoading,
  DetailEmpty
} from '../../components/common'
import { cn } from '@clarity/shadcn'

/**
 * HelloWorld 完整示例插件视图
 *
 * 展示如何使用详情视图组件库创建丰富的插件界面
 */
export function HelloWorldView({ context }: { context: PluginContext }) {
  const query = context.commandPalette.getQuery()

  // 状态管理
  const [selectedCategory, setSelectedCategory] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [favorites, setFavorites] = useState<string[]>(['item-1', 'item-3'])

  // 模拟数据
  const [items, setItems] = useState([
    { id: 'item-1', name: '重要文档.txt', type: '文档', modified: '2小时前', size: '2.3 KB' },
    { id: 'item-2', name: '项目截图.png', type: '图片', modified: '1天前', size: '1.2 MB' },
    { id: 'item-3', name: '配置文件.json', type: '配置', modified: '3天前', size: '856 B' },
    { id: 'item-4', name: '数据备份.zip', type: '压缩包', modified: '1周前', size: '15.7 MB' }
  ])

  // 模拟搜索
  const handleSearch = async () => {
    setIsLoading(true)
    setStatus('idle')

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (searchQuery.toLowerCase().includes('error')) {
      setStatus('error')
    } else {
      setStatus('success')
      // 过滤结果
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setItems(filtered)
    }

    setIsLoading(false)
  }

  // 切换收藏
  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  // 重置
  const handleReset = () => {
    setSearchQuery('')
    setStatus('idle')
    setItems([
      { id: 'item-1', name: '重要文档.txt', type: '文档', modified: '2小时前', size: '2.3 KB' },
      { id: 'item-2', name: '项目截图.png', type: '图片', modified: '1天前', size: '1.2 MB' },
      { id: 'item-3', name: '配置文件.json', type: '配置', modified: '3天前', size: '856 B' },
      { id: 'item-4', name: '数据备份.zip', type: '压缩包', modified: '1周前', size: '15.7 MB' }
    ])
  }

  return (
    <DetailLayout>
      <DetailSidebar>
        {/* 分类导航 */}
        <DetailSection title="分类">
          <DetailItem
            icon={Sparkles}
            title="概览"
            onClick={() => setSelectedCategory('overview')}
            className={cn(selectedCategory === 'overview' ? 'bg-accent/60' : '', 'w-full')}
          />
          <DetailItem
            icon={Search}
            title="搜索"
            onClick={() => setSelectedCategory('search')}
            className={cn(selectedCategory === 'search' ? 'bg-accent/60' : '', 'w-full')}
          />
          <DetailItem
            icon={Heart}
            title="收藏"
            badge={favorites.length.toString()}
            onClick={() => setSelectedCategory('favorites')}
            className={cn(selectedCategory === 'favorites' ? 'bg-accent/60' : '', 'w-full')}
          />
          <DetailItem
            icon={Settings}
            title="设置"
            onClick={() => setSelectedCategory('settings')}
            className={cn(selectedCategory === 'settings' ? 'bg-accent/60' : '', 'w-full')}
          />
        </DetailSection>
      </DetailSidebar>

      <DetailMain>
        {/* 根据选中的分类显示不同内容 */}
        {selectedCategory === 'overview' && (
          <>
            <DetailSection title="插件概览">
              <DetailStatus status="success" message="HelloWorld 插件运行正常" />

              {query && (
                <DetailItem
                  icon={Search}
                  title="当前查询"
                  subtitle={`"${query}"`}
                  description="这是从 command-palette 传递过来的查询参数"
                />
              )}

              <DetailItem
                icon={FileText}
                title="插件信息"
                subtitle="版本 1.0.0"
                description="这是一个完整的插件示例，展示了如何使用详情视图组件库"
                badge="示例"
              />
            </DetailSection>

            <DetailSection title="功能特性">
              <DetailItem
                icon={Coffee}
                title="开箱即用"
                subtitle="无需复杂配置"
                description="插件开发者可以专注于功能实现"
              />
            </DetailSection>
          </>
        )}

        {selectedCategory === 'search' && (
          <>
            <DetailSection title="搜索功能">
              <DetailInput
                icon={Search}
                placeholder="搜索文件... (输入 'error' 测试错误状态)"
                value={searchQuery}
                onChange={setSearchQuery}
                onEnter={handleSearch}
              />

              <div className="flex gap-2">
                <DetailButton onClick={handleSearch} disabled={isLoading} variant="default">
                  搜索
                </DetailButton>
                <DetailButton onClick={handleReset} variant="outline">
                  重置
                </DetailButton>
              </div>

              {status === 'success' && <DetailStatus status="success" message="搜索完成" />}
              {status === 'error' && <DetailStatus status="error" message="搜索失败，请重试" />}
            </DetailSection>

            <DetailSection title="搜索结果">
              {isLoading ? (
                <DetailLoading message="正在搜索文件..." />
              ) : items.length === 0 ? (
                <DetailEmpty
                  title="没有找到文件"
                  description="尝试使用不同的关键词搜索"
                  action={<DetailButton onClick={handleReset}>重置搜索</DetailButton>}
                />
              ) : (
                items.map((item) => (
                  <DetailItem
                    key={item.id}
                    icon={FileText}
                    title={item.name}
                    subtitle={`${item.modified} • ${item.size}`}
                    badge={item.type}
                    onClick={() => alert(`打开文件: ${item.name}`)}
                  >
                    <DetailButton
                      icon={favorites.includes(item.id) ? Heart : Heart}
                      onClick={(e) => {
                        e?.stopPropagation()
                        toggleFavorite(item.id)
                      }}
                      variant="ghost"
                      size="sm"
                      className={favorites.includes(item.id) ? 'text-red-500' : ''}
                    >
                      {favorites.includes(item.id) ? '已收藏' : '收藏'}
                    </DetailButton>
                  </DetailItem>
                ))
              )}
            </DetailSection>
          </>
        )}

        {selectedCategory === 'favorites' && (
          <DetailSection title="收藏的文件">
            {favorites.length === 0 ? (
              <DetailEmpty
                icon={Heart}
                title="暂无收藏"
                description="点击文件旁边的收藏按钮来添加收藏"
              />
            ) : (
              items
                .filter((item) => favorites.includes(item.id))
                .map((item) => (
                  <DetailItem
                    key={item.id}
                    icon={FileText}
                    title={item.name}
                    subtitle={`${item.modified} • ${item.size}`}
                    badge={item.type}
                    onClick={() => alert(`打开收藏文件: ${item.name}`)}
                  >
                    <DetailButton
                      icon={Heart}
                      onClick={(e) => {
                        e?.stopPropagation()
                        toggleFavorite(item.id)
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                    >
                      取消收藏
                    </DetailButton>
                  </DetailItem>
                ))
            )}
          </DetailSection>
        )}

        {selectedCategory === 'settings' && (
          <DetailSection title="插件设置">
            <DetailItem
              icon={Settings}
              title="自动搜索"
              subtitle="输入时自动执行搜索"
              description="启用后将在输入时实时搜索，而不需要手动点击搜索按钮"
            >
              <DetailButton variant="outline" size="sm">
                启用
              </DetailButton>
            </DetailItem>

            <DetailItem
              icon={FileText}
              title="搜索历史"
              subtitle="保存搜索记录"
              description="保存最近的搜索记录以便快速访问"
            >
              <DetailButton variant="outline" size="sm">
                清除历史
              </DetailButton>
            </DetailItem>

            <DetailStatus status="info" message="设置将自动保存" />
          </DetailSection>
        )}
      </DetailMain>
    </DetailLayout>
  )
}
