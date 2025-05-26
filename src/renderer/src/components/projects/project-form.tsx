import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Textarea } from '@renderer/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'

interface ProjectFormData {
  name: string
  description: string
  status: string
}

interface ProjectFormProps {
  formData: ProjectFormData
  setFormData: (data: ProjectFormData) => void
  onSubmit: () => void
  isSubmitting: boolean
  submitText: string
}

const statusOptions = [
  { value: 'active', label: '活跃', description: '正在进行中的项目' },
  { value: 'on_hold', label: '暂停', description: '暂时停止的项目' },
  { value: 'archived', label: '已归档', description: '已完成或不再活跃的项目' }
]

export function ProjectForm({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  submitText
}: ProjectFormProps) {
  return (
    <div className="space-y-6 pt-2">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          项目名称 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="为您的项目起一个名字"
          className="h-10"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">项目名称将用于文件夹命名和组织</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          项目描述
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="简要描述这个项目的目标和内容..."
          className="min-h-[80px] resize-none"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">可选，帮助您和团队成员了解项目内容</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status" className="text-sm font-medium">
          初始状态
        </Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            setFormData({ name: '', description: '', status: 'active' })
          }}
          disabled={isSubmitting}
          className="flex-1"
        >
          重置
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !formData.name.trim()}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              创建中...
            </>
          ) : (
            submitText
          )}
        </Button>
      </div>
    </div>
  )
}
