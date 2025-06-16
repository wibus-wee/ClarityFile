import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Filter,
  X,
  Calendar,
  HardDrive,
  FolderOpen,
  Image,
  FileText,
  Video,
  Music,
  Archive,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@clarity/shadcn/ui/button'
import { Separator } from '@clarity/shadcn/ui/separator'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Slider } from '@clarity/shadcn/ui/slider'
import { cn } from '@renderer/lib/utils'
import { useProjects } from '@renderer/hooks/use-tipc'

interface FileFilterSidebarProps {
  onFilterChange: (filters: {
    type?: string
    project?: string
    dateRange?: string
    sizeRange?: number[]
  }) => void
}

export function FileFilterSidebar({ onFilterChange }: FileFilterSidebarProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [sizeRange, setSizeRange] = useState([0, 100])
  const [dateRange, setDateRange] = useState<string>('all')

  // 获取真实的项目数据
  const { data: projectsData } = useProjects()

  const fileTypes = [
    { id: 'image', label: '图片', icon: Image, color: 'text-green-600' },
    { id: 'text', label: '文档', icon: FileText, color: 'text-orange-600' },
    { id: 'video', label: '视频', icon: Video, color: 'text-purple-600' },
    { id: 'audio', label: '音频', icon: Music, color: 'text-blue-600' },
    { id: 'application', label: '应用/压缩包', icon: Archive, color: 'text-gray-600' }
  ]

  const dateRanges = [
    { id: 'all', label: '全部时间' },
    { id: 'today', label: '今天' },
    { id: 'week', label: '本周' },
    { id: 'month', label: '本月' },
    { id: 'year', label: '今年' }
  ]

  // 转换项目数据格式
  const projects = (projectsData || []).map((project) => ({
    id: project.id,
    name: project.name,
    fileCount: 0 // TODO: 从文件统计中获取实际文件数量
  }))

  const toggleType = (typeId: string) => {
    const newTypes = new Set(selectedTypes)
    if (newTypes.has(typeId)) {
      newTypes.delete(typeId)
    } else {
      newTypes.add(typeId)
    }
    setSelectedTypes(newTypes)
    // 传递所有选中的类型，用逗号分隔
    const selectedTypesArray = Array.from(newTypes)
    onFilterChange({
      type: selectedTypesArray.length > 0 ? selectedTypesArray.join(',') : undefined
    })
  }

  const toggleProject = (projectId: string) => {
    const newProjects = new Set(selectedProjects)
    if (newProjects.has(projectId)) {
      newProjects.delete(projectId)
    } else {
      newProjects.add(projectId)
    }
    setSelectedProjects(newProjects)
    // 传递所有选中的项目，用逗号分隔
    const selectedProjectsArray = Array.from(newProjects)
    onFilterChange({
      project: selectedProjectsArray.length > 0 ? selectedProjectsArray.join(',') : undefined
    })
  }

  const clearAllFilters = () => {
    setSelectedTypes(new Set())
    setSelectedProjects(new Set())
    setSizeRange([0, 100])
    setDateRange('all')
    onFilterChange({
      type: undefined,
      project: undefined,
      dateRange: undefined,
      sizeRange: undefined
    })
  }

  const hasActiveFilters =
    selectedTypes.size > 0 ||
    selectedProjects.size > 0 ||
    dateRange !== 'all' ||
    sizeRange[0] !== 0 ||
    sizeRange[1] !== 100

  return (
    <div className="h-full bg-background flex flex-col">
      {/* 头部 */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <h2 className="font-medium">筛选</h2>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
              <X className="w-3 h-3 mr-1" />
              清除
            </Button>
          )}
        </div>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 flex flex-wrap gap-1"
          >
            {Array.from(selectedTypes).map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {fileTypes.find((t) => t.id === type)?.label}
              </Badge>
            ))}
            {Array.from(selectedProjects).map((projectId) => (
              <Badge key={projectId} variant="secondary" className="text-xs">
                {projects.find((p) => p.id === projectId)?.name}
              </Badge>
            ))}
          </motion.div>
        )}
      </div>

      {/* 筛选内容 */}
      <div className="flex-1 overflow-auto p-4 space-y-6 min-h-0">
        {/* 文件类型 */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Archive className="w-4 h-4" />
            文件类型
          </h3>
          <div className="space-y-2">
            {fileTypes.map((type) => {
              const isSelected = selectedTypes.has(type.id)
              const TypeIcon = type.icon

              return (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => toggleType(type.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2 rounded-md transition-colors text-left',
                    isSelected
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <TypeIcon className={cn('w-4 h-4', type.color)} />
                  <span className="text-sm flex-1">{type.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </motion.button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* 所属项目 */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            所属项目
          </h3>
          <div className="space-y-2">
            {projects.map((project) => {
              const isSelected = selectedProjects.has(project.id)

              return (
                <motion.button
                  key={project.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => toggleProject(project.id)}
                  className={cn(
                    'w-full flex items-center justify-between p-2 rounded-md transition-colors text-left',
                    isSelected
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{project.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {project.fileCount}
                  </Badge>
                </motion.button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* 时间范围 */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            时间范围
          </h3>
          <div className="space-y-2">
            {dateRanges.map((range) => {
              const isSelected = dateRange === range.id

              return (
                <motion.button
                  key={range.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => {
                    setDateRange(range.id)
                    onFilterChange({ dateRange: range.id === 'all' ? undefined : range.id })
                  }}
                  className={cn(
                    'w-full flex items-center justify-between p-2 rounded-md transition-colors text-left',
                    isSelected
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <span className="text-sm">{range.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </motion.button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* 文件大小 */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            文件大小
          </h3>
          <div className="space-y-3">
            <Slider
              value={sizeRange}
              onValueChange={(value) => {
                setSizeRange(value)
                onFilterChange({ sizeRange: value })
              }}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 KB</span>
              <span>100+ MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
