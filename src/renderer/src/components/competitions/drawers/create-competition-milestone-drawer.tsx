import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from '@renderer/components/ui/drawer'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { Label } from '@renderer/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Calendar } from '@renderer/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { Target, Calendar as CalendarIcon, Loader2, Trophy } from 'lucide-react'
import { useCreateCompetitionMilestone, useGetAllCompetitionSeries } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@renderer/lib/utils'
import type { CreateCompetitionMilestoneInput } from '../../../../../main/types/inputs'

interface CreateCompetitionMilestoneDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedSeriesId?: string | null
  onSuccess?: () => void
}

interface FormData {
  competitionSeriesId: string
  levelName: string
  dueDate: Date | undefined
  description: string
}

const initialFormData: FormData = {
  competitionSeriesId: '',
  levelName: '',
  dueDate: undefined,
  description: ''
}

export function CreateCompetitionMilestoneDrawer({
  open,
  onOpenChange,
  selectedSeriesId,
  onSuccess
}: CreateCompetitionMilestoneDrawerProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [calendarOpen, setCalendarOpen] = useState(false)

  const { data: competitionSeries } = useGetAllCompetitionSeries()
  const { trigger: createMilestone, isMutating } = useCreateCompetitionMilestone()

  // 当选中的系列ID变化时，更新表单
  useEffect(() => {
    if (selectedSeriesId) {
      setFormData((prev) => ({ ...prev, competitionSeriesId: selectedSeriesId }))
    }
  }, [selectedSeriesId])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.competitionSeriesId) {
      newErrors.competitionSeriesId = '请选择赛事系列'
    }

    if (!formData.levelName.trim()) {
      newErrors.levelName = '里程碑名称不能为空'
    } else if (formData.levelName.trim().length < 2) {
      newErrors.levelName = '里程碑名称至少需要2个字符'
    } else if (formData.levelName.trim().length > 100) {
      newErrors.levelName = '里程碑名称不能超过100个字符'
    }

    if (formData.description.trim().length > 500) {
      newErrors.description = '描述不能超过500个字符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const input: CreateCompetitionMilestoneInput = {
        competitionSeriesId: formData.competitionSeriesId,
        levelName: formData.levelName.trim(),
        dueDateMilestone: formData.dueDate,
        notes: formData.description.trim() || undefined
      }

      await createMilestone(input)

      const selectedSeries = competitionSeries?.find((s) => s.id === formData.competitionSeriesId)

      toast.success('赛事里程碑创建成功', {
        description: `"${formData.levelName}" 已添加到 "${selectedSeries?.name}"`
      })

      // 重置表单
      setFormData(initialFormData)
      setErrors({})

      // 关闭抽屉
      onOpenChange(false)

      // 调用成功回调
      onSuccess?.()
    } catch (error) {
      console.error('创建赛事里程碑失败:', error)
      toast.error('创建赛事里程碑失败', {
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    }
  }

  const handleCancel = () => {
    setFormData(initialFormData)
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DrawerTitle>添加赛事里程碑</DrawerTitle>
              <DrawerDescription>为赛事系列添加一个新的里程碑节点</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 overflow-y-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 赛事系列选择 */}
            <div className="space-y-2">
              <Label htmlFor="series" className="text-sm font-medium">
                赛事系列 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.competitionSeriesId}
                onValueChange={(value) => handleInputChange('competitionSeriesId', value)}
              >
                <SelectTrigger className={errors.competitionSeriesId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="选择赛事系列" />
                </SelectTrigger>
                <SelectContent>
                  {competitionSeries?.map((series) => (
                    <SelectItem key={series.id} value={series.id}>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        {series.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.competitionSeriesId && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive"
                >
                  {errors.competitionSeriesId}
                </motion.p>
              )}
            </div>

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
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
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
                placeholder="描述这个里程碑的要求、评判标准或注意事项..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={
                  errors.description ? 'border-destructive focus-visible:ring-destructive' : ''
                }
                rows={4}
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
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 字符
              </p>
            </div>
          </form>
        </motion.div>

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
              disabled={isMutating || !formData.levelName.trim() || !formData.competitionSeriesId}
              className="flex-1 gap-2"
            >
              {isMutating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  创建里程碑
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
