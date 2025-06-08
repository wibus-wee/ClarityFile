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
import { Button } from '@renderer/components/ui/button'
import { Separator } from '@renderer/components/ui/separator'
import { Badge } from '@renderer/components/ui/badge'
import { Slider } from '@renderer/components/ui/slider'
import { cn } from '@renderer/lib/utils'

interface FileFilterSidebarProps {
  onFilterChange: (filters: any) => void
}

export function FileFilterSidebar({ onFilterChange }: FileFilterSidebarProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [sizeRange, setSizeRange] = useState([0, 100])
  const [dateRange, setDateRange] = useState<string>('all')

  const fileTypes = [
    { id: 'image', label: '图片', icon: Image, color: 'text-green-600' },
    { id: 'text', label: '文档', icon: FileText, color: 'text-orange-600' },
    { id: 'video', label: '视频', icon: Video, color: 'text-purple-600' },
    { id: 'audio', label: '音频', icon: Music, color: 'text-blue-600' },
    { id: 'application', label: '应用', icon: Archive, color: 'text-gray-600' }
  ]

  const dateRanges = [
    { id: 'all', label: '全部时间' },
    { id: 'today', label: '今天' },
    { id: 'week', label: '本周' },
    { id: 'month', label: '本月' },
    { id: 'year', label: '今年' }
  ]

  // 模拟项目数据
  const projects = [
    { id: '1', name: '项目 A', fileCount: 45 },
    { id: '2', name: '项目 B', fileCount: 32 },
    { id: '3', name: '项目 C', fileCount: 28 },
    { id: '4', name: '项目 D', fileCount: 15 }
  ]

  const toggleType = (typeId: string) => {
    const newTypes = new Set(selectedTypes)
    if (newTypes.has(typeId)) {
      newTypes.delete(typeId)
    } else {
      newTypes.add(typeId)
    }
    setSelectedTypes(newTypes)
    onFilterChange({ types: Array.from(newTypes) })
  }

  const toggleProject = (projectId: string) => {
    const newProjects = new Set(selectedProjects)
    if (newProjects.has(projectId)) {
      newProjects.delete(projectId)
    } else {
      newProjects.add(projectId)
    }
    setSelectedProjects(newProjects)
    onFilterChange({ projects: Array.from(newProjects) })
  }

  const clearAllFilters = () => {
    setSelectedTypes(new Set())
    setSelectedProjects(new Set())
    setSizeRange([0, 100])
    setDateRange('all')
    onFilterChange({})
  }

  const hasActiveFilters =
    selectedTypes.size > 0 || selectedProjects.size > 0 || dateRange !== 'all'

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
                  whileTap={{ scale: 0.98 }}
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
                  whileTap={{ scale: 0.98 }}
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
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDateRange(range.id)}
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
              onValueChange={setSizeRange}
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
