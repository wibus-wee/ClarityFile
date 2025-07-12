import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import {
  Calendar,
  Clock,
  Trophy,
  Target,
  Users,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react'
import { useCompetitionTimeline } from '@renderer/hooks/use-tipc'
import { cn } from '@renderer/lib/utils'
import { format, isAfter, isBefore, startOfDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useNavigate } from '@tanstack/react-router'
import { MilestoneDetailsDialog } from './dialogs/milestone-details-dialog'
import { MilestoneParticipatingProjectsDialog } from './dialogs/milestone-participating-projects-dialog'
import type { CompetitionTimelineItemOutput } from '@main/types/competition-schemas'

interface CompetitionTimelineProps {
  searchQuery: string
  sortBy: 'name' | 'created' | 'milestones'
}

interface TimelineItemProps {
  item: CompetitionTimelineItemOutput
  isExpanded: boolean
  onToggle: () => void
  onViewDetails: (item: CompetitionTimelineItemOutput) => void
  onViewSeries: (item: CompetitionTimelineItemOutput) => void
  onViewProjects: (item: CompetitionTimelineItemOutput) => void
}

function TimelineItem({
  item,
  isExpanded,
  onToggle,
  onViewDetails,
  onViewSeries,
  onViewProjects
}: TimelineItemProps) {
  const now = new Date()
  const itemDate = item.date ? new Date(item.date) : null
  const isPast = itemDate ? isBefore(itemDate, startOfDay(now)) : false
  const isToday = itemDate ? format(itemDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') : false
  const isFuture = itemDate ? isAfter(itemDate, startOfDay(now)) : false

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative"
    >
      {/* 时间轴线条 */}
      <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />

      {/* 时间轴节点 */}
      <div
        className={cn(
          'absolute left-4 top-8 w-4 h-4 rounded-full border-2 bg-background',
          isPast && 'border-muted-foreground bg-muted-foreground',
          isToday && 'border-primary bg-primary animate-pulse',
          isFuture && 'border-primary bg-background'
        )}
      />

      {/* 内容卡片 */}
      <div className="ml-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'p-4 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors',
            isPast && 'opacity-75',
            isToday && 'ring-1 ring-primary/30 bg-primary/5'
          )}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 35
          }}
        >
          {/* 头部信息 */}
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center shrink-0',
                    isPast && 'bg-muted/50',
                    isToday && 'bg-primary/10',
                    isFuture && 'bg-primary/10'
                  )}
                >
                  <Target
                    className={cn(
                      'h-4 w-4',
                      isPast && 'text-muted-foreground',
                      isToday && 'text-primary',
                      isFuture && 'text-primary'
                    )}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {item.seriesName}
                    </Badge>
                    {isToday && <Badge className="text-xs bg-primary/20 text-primary">今天</Badge>}
                  </div>
                </div>
              </div>

              {/* 日期和时间 */}
              {itemDate && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground ml-11">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(itemDate, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {isPast ? '已过期' : isFuture ? '即将到来' : '今天'}
                  </span>
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={onToggle} className="gap-2">
              {isExpanded ? (
                <>
                  收起
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  详情
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* 基本信息 */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground ml-11">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {item.participatingProjectsCount} 个项目参与
            </span>
          </div>

          {/* 展开的详细信息 */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, paddingTop: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', paddingTop: 16, marginTop: 16 }}
                exit={{ opacity: 0, height: 0, paddingTop: 0, marginTop: 0 }}
                transition={{
                  duration: 0.3,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
                className="ml-11 border-t border-border overflow-hidden"
              >
                {item.description && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">描述</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-7 px-2 text-xs"
                    onClick={() => onViewDetails(item)}
                  >
                    <Target className="h-3 w-3" />
                    查看详情
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-7 px-2 text-xs"
                    onClick={() => onViewSeries(item)}
                  >
                    <Trophy className="h-3 w-3" />
                    查看系列
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 h-7 px-2 text-xs"
                    onClick={() => onViewProjects(item)}
                  >
                    <Users className="h-3 w-3" />
                    查看项目
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function CompetitionTimeline({ searchQuery }: CompetitionTimelineProps) {
  const navigate = useNavigate()
  const { data: timelineItems, isLoading } = useCompetitionTimeline()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [timeFilter, setTimeFilter] = useState<'all' | 'past' | 'upcoming' | 'today'>('all')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [projectsDialogOpen, setProjectsDialogOpen] = useState(false)

  // 处理操作
  const handleViewDetails = (item: CompetitionTimelineItemOutput) => {
    setSelectedItem(item)
    setDetailsDialogOpen(true)
  }

  const handleViewSeries = (item: CompetitionTimelineItemOutput) => {
    // 跳转到赛事系列页面并直接显示该系列的里程碑列表
    navigate({
      to: '/competitions',
      search: {
        view: 'series',
        seriesId: item.seriesId,
        showMilestones: 'true'
      }
    })
  }

  const handleViewProjects = (item: CompetitionTimelineItemOutput) => {
    setSelectedItem(item)
    setProjectsDialogOpen(true)
  }

  // 过滤和排序逻辑
  const filteredAndSortedItems = useMemo(() => {
    if (!timelineItems) return []

    const filtered = timelineItems.filter((item) => {
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !item.title.toLowerCase().includes(query) &&
          !item.seriesName.toLowerCase().includes(query) &&
          !item.description?.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // 时间过滤
      if (timeFilter !== 'all' && item.date) {
        const now = new Date()
        const itemDate = new Date(item.date)
        const today = format(now, 'yyyy-MM-dd')
        const itemDateStr = format(itemDate, 'yyyy-MM-dd')

        switch (timeFilter) {
          case 'past':
            return isBefore(itemDate, startOfDay(now))
          case 'today':
            return today === itemDateStr
          case 'upcoming':
            return isAfter(itemDate, startOfDay(now))
        }
      }

      return true
    })

    // 排序 - 按日期排序，最新的在前
    filtered.sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return filtered
  }, [timelineItems, searchQuery, timeFilter])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="relative">
            {/* 时间轴线条 */}
            <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />

            {/* 时间轴节点 */}
            <div className="absolute left-4 top-8 w-4 h-4 rounded-full border-2 border-muted bg-muted animate-pulse" />

            {/* 内容卡片 */}
            <div className="ml-12 pb-8">
              <div className="p-4 border border-border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-muted/50 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted/50 rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-muted/50 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!timelineItems || timelineItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">暂无赛事时间轴</h3>
        <p className="text-muted-foreground">创建赛事系列和里程碑后，时间轴将显示在这里</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 时间过滤器 */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'upcoming', label: '即将到来' },
            { key: 'today', label: '今天' },
            { key: 'past', label: '已过期' }
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={timeFilter === filter.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeFilter(filter.key as any)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 结果统计 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          找到 {filteredAndSortedItems.length} 个里程碑
        </p>
      </div>

      {/* 时间轴 */}
      {filteredAndSortedItems.length > 0 ? (
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedItems.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                isExpanded={expandedItems.has(item.id)}
                onToggle={() => toggleExpanded(item.id)}
                onViewDetails={handleViewDetails}
                onViewSeries={() => handleViewSeries(item)}
                onViewProjects={handleViewProjects}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">未找到匹配的里程碑</h3>
          <p className="text-muted-foreground">尝试调整搜索条件或时间筛选器</p>
        </motion.div>
      )}

      {/* 对话框组件 */}
      <MilestoneDetailsDialog
        milestone={selectedItem}
        isOpen={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onViewSeries={() => {
          if (selectedItem) {
            setDetailsDialogOpen(false)
            handleViewSeries(selectedItem)
          }
        }}
        onViewProjects={() => {
          setDetailsDialogOpen(false)
          setSelectedItem(selectedItem)
          setProjectsDialogOpen(true)
        }}
      />

      {/* 参与项目对话框 */}
      <MilestoneParticipatingProjectsDialog
        milestone={selectedItem}
        isOpen={projectsDialogOpen}
        onOpenChange={setProjectsDialogOpen}
      />
    </div>
  )
}
