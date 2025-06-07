import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@renderer/components/ui/drawer'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { Label } from '@renderer/components/ui/label'
import { Calendar } from '@renderer/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { Target, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { useUpdateCompetitionMilestone } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@renderer/lib/utils'
import type { UpdateCompetitionMilestoneInput } from '../../../../../main/types/inputs'
import type { CompetitionMilestoneOutput } from '../../../../../main/types/outputs'

interface EditCompetitionMilestoneDrawerProps {
  milestone: CompetitionMilestoneOutput | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormData {
  levelName: string
  dueDate: Date | undefined
  description: string
}

export function EditCompetitionMilestoneDrawer({
  milestone,
  open,
  onOpenChange,
  onSuccess
}: EditCompetitionMilestoneDrawerProps) {
  const [formData, setFormData] = useState<FormData>({
    levelName: '',
    dueDate: undefined,
    description: ''
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [calendarOpen, setCalendarOpen] = useState(false)

  const { trigger: updateMilestone, isMutating } = useUpdateCompetitionMilestone()

  // 当里程碑数据变化时更新表单
  useEffect(() => {
    if (milestone) {
      setFormData({
        levelName: milestone.levelName,
        dueDate: milestone.dueDate ? new Date(milestone.dueDate) : undefined,
        description: milestone.description || ''
      })
      setErrors({})
    }
  }, [milestone])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.levelName.trim()) {
      newErrors.levelName = '请输入里程碑名称'
    } else if (formData.levelName.trim().length > 100) {
      newErrors.levelName = '里程碑名称不能超过100个字符'
    }

    if (formData.description.length > 500) {
      newErrors.description = '描述不能超过500个字符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!milestone || !validateForm()) {
      return
    }

    try {
      const input: UpdateCompetitionMilestoneInput = {
        id: milestone.id,
        levelName: formData.levelName.trim(),
        dueDateMilestone: formData.dueDate,
        notes: formData.description.trim() || undefined
      }

      await updateMilestone(input)

      toast.success('里程碑更新成功', {
        description: `"${formData.levelName}" 已成功更新`
      })

      // 关闭抽屉
      onOpenChange(false)

      // 调用成功回调
      onSuccess?.()
    } catch (error) {
      console.error('更新里程碑失败:', error)
      toast.error('更新里程碑失败', {
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    }
  }

  const handleCancel = () => {
    if (milestone) {
      setFormData({
        levelName: milestone.levelName,
        dueDate: milestone.dueDate ? new Date(milestone.dueDate) : undefined,
        description: milestone.description || ''
      })
    }
    setErrors({})
    onOpenChange(false)
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // 清除对应字段的错误
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (!milestone) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DrawerTitle>编辑里程碑</DrawerTitle>
              <DrawerDescription>修改里程碑的基本信息</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="px-4 space-y-6 overflow-y-auto"
        >
          {/* 里程碑名称 */}
          <div className="space-y-2">
            <Label htmlFor="levelName" className="text-sm font-medium">
              里程碑名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="levelName"
              placeholder="例如：初赛、复赛、决赛"
              value={formData.levelName}
              onChange={(e) => handleInputChange('levelName', e.target.value)}
              className={
                errors.levelName ? 'border-destructive focus-visible:ring-destructive' : ''
              }
              maxLength={100}
            />
            {errors.levelName && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive"
              >
                {errors.levelName}
              </motion.p>
            )}
            <p className="text-xs text-muted-foreground">{formData.levelName.length}/100 字符</p>
          </div>

          {/* 截止日期 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">截止日期（可选）</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate
                    ? format(formData.dueDate, 'yyyy年MM月dd日', { locale: zhCN })
                    : '选择截止日期'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => {
                    handleInputChange('dueDate', date)
                    setCalendarOpen(false)
                  }}
                  locale={zhCN}
                  initialFocus
                />
                {formData.dueDate && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleInputChange('dueDate', undefined)
                        setCalendarOpen(false)
                      }}
                      className="w-full"
                    >
                      清除日期
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              描述（可选）
            </Label>
            <Textarea
              id="description"
              placeholder="描述这个里程碑的要求、目标或注意事项..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={
                errors.description ? 'border-destructive focus-visible:ring-destructive' : ''
              }
              rows={3}
              maxLength={500}
            />
            {errors.description && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive"
              >
                {errors.description}
              </motion.p>
            )}
            <p className="text-xs text-muted-foreground">{formData.description.length}/500 字符</p>
          </div>
        </motion.form>

        <DrawerFooter>
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isMutating}
              className="flex-1"
            >
              取消
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isMutating || !formData.levelName.trim()}
              className="flex-1 gap-2"
            >
              {isMutating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  更新中...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  更新里程碑
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
