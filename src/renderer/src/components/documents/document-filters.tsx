import { X } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select'
import { motion } from 'framer-motion'

interface DocumentFiltersProps {
  projects: Array<{ id: string; name: string }>
  documentTypes: Array<{ value: string; label: string }>
  selectedProject: string
  selectedType: string
  selectedStatus: string
  onProjectChange: (value: string) => void
  onTypeChange: (value: string) => void
  onStatusChange: (value: string) => void
  onReset: () => void
}

const statusOptions = [
  { value: 'active', label: '活跃' },
  { value: 'draft', label: '草稿' },
  { value: 'archived', label: '已归档' }
]

export function DocumentFilters({
  projects,
  documentTypes,
  selectedProject,
  selectedType,
  selectedStatus,
  onProjectChange,
  onTypeChange,
  onStatusChange,
  onReset
}: DocumentFiltersProps) {
  const activeFilters = [
    selectedProject && { type: 'project', value: selectedProject, label: projects.find(p => p.id === selectedProject)?.name || selectedProject },
    selectedType && { type: 'type', value: selectedType, label: documentTypes.find(t => t.value === selectedType)?.label || selectedType },
    selectedStatus && { type: 'status', value: selectedStatus, label: statusOptions.find(s => s.value === selectedStatus)?.label || selectedStatus }
  ].filter(Boolean) as Array<{ type: string; value: string; label: string }>

  const removeFilter = (type: string) => {
    switch (type) {
      case 'project':
        onProjectChange('')
        break
      case 'type':
        onTypeChange('')
        break
      case 'status':
        onStatusChange('')
        break
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="border rounded-lg p-4 bg-muted/30"
    >
      <div className="flex flex-col gap-4">
        {/* 筛选选项 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 项目筛选 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">项目</label>
            <Select value={selectedProject} onValueChange={onProjectChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择项目" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部项目</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 文档类型筛选 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">文档类型</label>
            <Select value={selectedType} onValueChange={onTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部类型</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 状态筛选 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">状态</label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 已选筛选条件和重置按钮 */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">已选筛选条件:</span>
            {activeFilters.map((filter) => (
              <Badge
                key={`${filter.type}-${filter.value}`}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {filter.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0.5 hover:bg-transparent"
                  onClick={() => removeFilter(filter.type)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs h-6"
            >
              清除全部
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
