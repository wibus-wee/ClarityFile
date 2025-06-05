import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Form,
  FormControl,
  FormDescription,
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
import { Trophy, Plus, Loader2 } from 'lucide-react'
import { 
  useGetAllCompetitionSeries, 
  useGetCompetitionMilestones,
  useAddProjectToCompetition 
} from '@renderer/hooks/use-tipc'

const addCompetitionSchema = z.object({
  seriesId: z.string().min(1, '请选择赛事系列'),
  milestoneId: z.string().min(1, '请选择赛事里程碑'),
  statusInMilestone: z.string().optional()
})

type AddCompetitionFormData = z.infer<typeof addCompetitionSchema>

interface AddCompetitionDrawerProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const competitionStatuses = [
  { value: '准备中', label: '准备中' },
  { value: '进行中', label: '进行中' },
  { value: '已完成', label: '已完成' },
  { value: '已提交', label: '已提交' },
  { value: '已获奖', label: '已获奖' },
  { value: '未获奖', label: '未获奖' },
  { value: '已放弃', label: '已放弃' }
]

export function AddCompetitionDrawer({
  projectId,
  open,
  onOpenChange,
  onSuccess
}: AddCompetitionDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('')
  
  const { data: competitionSeries, isLoading: isLoadingSeries } = useGetAllCompetitionSeries()
  const { data: milestones, isLoading: isLoadingMilestones } = useGetCompetitionMilestones(
    selectedSeriesId,
    { enabled: !!selectedSeriesId }
  )
  const addProjectToCompetition = useAddProjectToCompetition()

  const form = useForm<AddCompetitionFormData>({
    resolver: zodResolver(addCompetitionSchema),
    defaultValues: {
      seriesId: '',
      milestoneId: '',
      statusInMilestone: '准备中'
    }
  })

  // 重置表单当抽屉关闭时
  useEffect(() => {
    if (!open) {
      form.reset()
      setSelectedSeriesId('')
    }
  }, [open, form])

  // 当选择的系列改变时，重置里程碑选择
  useEffect(() => {
    if (selectedSeriesId !== form.getValues('seriesId')) {
      form.setValue('milestoneId', '')
    }
  }, [selectedSeriesId, form])

  const onSubmit = async (data: AddCompetitionFormData) => {
    if (!projectId) return

    setIsSubmitting(true)
    try {
      await addProjectToCompetition.mutateAsync({
        projectId,
        competitionMilestoneId: data.milestoneId,
        statusInMilestone: data.statusInMilestone
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('关联赛事失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            关联项目到赛事
          </DrawerTitle>
          <DrawerDescription>
            选择要关联的赛事系列和具体里程碑，设置项目在该赛事中的状态
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* 赛事系列选择 */}
                <FormField
                  control={form.control}
                  name="seriesId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>赛事系列 *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value)
                          setSelectedSeriesId(value)
                        }} 
                        value={field.value}
                        disabled={isLoadingSeries}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingSeries ? "加载中..." : "选择赛事系列"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {competitionSeries?.map((series) => (
                            <SelectItem key={series.id} value={series.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{series.name}</span>
                                {series.notes && (
                                  <span className="text-xs text-muted-foreground">{series.notes}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>选择要参与的赛事系列</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 赛事里程碑选择 */}
                <FormField
                  control={form.control}
                  name="milestoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>赛事里程碑 *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!selectedSeriesId || isLoadingMilestones}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue 
                              placeholder={
                                !selectedSeriesId 
                                  ? "请先选择赛事系列" 
                                  : isLoadingMilestones 
                                    ? "加载中..." 
                                    : "选择赛事里程碑"
                              } 
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {milestones?.map((milestone) => (
                            <SelectItem key={milestone.id} value={milestone.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{milestone.levelName}</span>
                                {milestone.dueDate && (
                                  <span className="text-xs text-muted-foreground">
                                    截止: {new Date(milestone.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>选择具体的赛事里程碑或阶段</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 状态选择 */}
                <FormField
                  control={form.control}
                  name="statusInMilestone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>项目状态</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择项目在该赛事中的状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {competitionStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>设置项目在该赛事里程碑中的当前状态</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            </form>
          </Form>
        </div>

        <DrawerFooter>
          <div className="flex gap-2">
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  关联中...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  关联到赛事
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
