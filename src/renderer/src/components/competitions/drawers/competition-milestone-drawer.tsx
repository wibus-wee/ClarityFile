import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Calendar } from '@renderer/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { Target, Calendar as CalendarIcon, Loader2, Trophy, Plus, Edit } from 'lucide-react'
import { 
  useCreateCompetitionMilestone, 
  useUpdateCompetitionMilestone,
  useGetAllCompetitionSeries 
} from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@renderer/lib/utils'
import { 
  createCompetitionMilestoneSchema,
  updateCompetitionMilestoneSchema 
} from '../../../../../main/types/competition-schemas'
import type { 
  CreateCompetitionMilestoneInput,
  UpdateCompetitionMilestoneInput,
  CompetitionMilestoneOutput 
} from '../../../../../main/types/competition-schemas'

interface CompetitionMilestoneDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  milestone?: CompetitionMilestoneOutput | null // 编辑时传入，创建时为空
  selectedSeriesId?: string // 创建时可以预选系列
  onSuccess?: () => void
}

// 根据模式选择合适的 Schema
const getFormSchema = (isEdit: boolean) => 
  isEdit ? updateCompetitionMilestoneSchema : createCompetitionMilestoneSchema

type MilestoneFormData = z.infer<typeof createCompetitionMilestoneSchema> & 
  Partial<z.infer<typeof updateCompetitionMilestoneSchema>>

export function CompetitionMilestoneDrawer({
  open,
  onOpenChange,
  milestone,
  selectedSeriesId,
  onSuccess
}: CompetitionMilestoneDrawerProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  
  const isEdit = !!milestone
  const { data: competitionSeries } = useGetAllCompetitionSeries()
  const { trigger: createMilestone, isMutating: isCreating } = useCreateCompetitionMilestone()
  const { trigger: updateMilestone, isMutating: isUpdating } = useUpdateCompetitionMilestone()
  
  const isMutating = isCreating || isUpdating

  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(getFormSchema(isEdit)),
    defaultValues: {
      competitionSeriesId: selectedSeriesId || '',
      levelName: '',
      dueDateMilestone: undefined,
      notes: '',
      ...(isEdit && { id: '' })
    }
  })

  // 当里程碑数据或选中系列变化时更新表单
  useEffect(() => {
    if (milestone) {
      // 编辑模式
      form.reset({
        id: milestone.id,
        competitionSeriesId: milestone.competitionSeriesId,
        levelName: milestone.levelName,
        dueDateMilestone: milestone.dueDate ? new Date(milestone.dueDate) : undefined,
        notes: milestone.description || ''
      })
    } else if (selectedSeriesId) {
      // 创建模式，预选系列
      form.setValue('competitionSeriesId', selectedSeriesId)
    }
  }, [milestone, selectedSeriesId, form])

  const onSubmit = async (data: MilestoneFormData) => {
    try {
      if (isEdit && milestone) {
        // 编辑模式
        const input: UpdateCompetitionMilestoneInput = {
          id: milestone.id,
          levelName: data.levelName?.trim(),
          dueDateMilestone: data.dueDateMilestone,
          notes: data.notes?.trim() || undefined
        }
        await updateMilestone(input)
        
        toast.success('里程碑更新成功', {
          description: `"${data.levelName}" 已成功更新`
        })
      } else {
        // 创建模式
        const input: CreateCompetitionMilestoneInput = {
          competitionSeriesId: data.competitionSeriesId!,
          levelName: data.levelName!.trim(),
          dueDateMilestone: data.dueDateMilestone,
          notes: data.notes?.trim() || undefined
        }
        await createMilestone(input)
        
        const selectedSeries = competitionSeries?.find((s) => s.id === data.competitionSeriesId)
        toast.success('赛事里程碑创建成功', {
          description: `"${data.levelName}" 已添加到 "${selectedSeries?.name}"`
        })
      }

      // 重置表单
      form.reset()
      
      // 关闭抽屉
      onOpenChange(false)
      
      // 调用成功回调
      onSuccess?.()
    } catch (error) {
      console.error(`${isEdit ? '更新' : '创建'}赛事里程碑失败:`, error)
      toast.error(`${isEdit ? '更新' : '创建'}赛事里程碑失败`, {
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
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
              <DrawerTitle>
                {isEdit ? '编辑赛事里程碑' : '创建赛事里程碑'}
              </DrawerTitle>
              <DrawerDescription>
                {isEdit ? '修改里程碑的详细信息' : '为赛事系列添加新的里程碑节点'}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <Form {...form}>
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-4 pb-4 overflow-y-auto space-y-6"
          >
            {/* 赛事系列选择 - 仅在创建模式显示 */}
            {!isEdit && (
              <FormField
                control={form.control}
                name="competitionSeriesId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      赛事系列 <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择赛事系列" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {competitionSeries?.map((series) => (
                          <SelectItem key={series.id} value={series.id}>
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-primary" />
                              {series.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 里程碑名称 */}
            <FormField
              control={form.control}
              name="levelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    里程碑名称 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如：初赛、复赛、决赛"
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">{field.value?.length || 0}/100 字符</p>
                </FormItem>
              )}
            />

            {/* 截止日期 */}
            <FormField
              control={form.control}
              name="dueDateMilestone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>截止日期（可选）</FormLabel>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, 'yyyy年MM月dd日', { locale: zhCN })
                            : '选择截止日期'}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          setCalendarOpen(false)
                        }}
                        disabled={(date) => date < new Date()}
                        locale={zhCN}
                        initialFocus
                      />
                      {field.value && (
                        <div className="p-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              field.onChange(undefined)
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 描述 */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述（可选）</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="描述这个里程碑的要求、评判标准或注意事项..."
                      rows={4}
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">{field.value?.length || 0}/500 字符</p>
                </FormItem>
              )}
            />
          </motion.form>
        </Form>

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
              onClick={form.handleSubmit(onSubmit)}
              disabled={isMutating}
              className="flex-1 gap-2"
            >
              {isMutating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEdit ? '更新中...' : '创建中...'}
                </>
              ) : (
                <>
                  {isEdit ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {isEdit ? '更新里程碑' : '创建里程碑'}
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
