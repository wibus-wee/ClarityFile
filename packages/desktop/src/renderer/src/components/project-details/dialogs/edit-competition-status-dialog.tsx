import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@clarity/shadcn/ui/dialog'
import { Button } from '@clarity/shadcn/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@clarity/shadcn/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@clarity/shadcn/ui/select'
import { Edit, Loader2 } from 'lucide-react'
import { useUpdateProjectCompetitionStatus } from '@renderer/hooks/use-tipc'

const editStatusSchema = z.object({
  statusInMilestone: z.string().min(1, '请选择状态')
})

type EditStatusFormData = z.infer<typeof editStatusSchema>

interface EditCompetitionStatusDialogProps {
  projectId: string
  competitionMilestoneId: string
  currentStatus: string | null
  competitionName: string
  levelName: string
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

export function EditCompetitionStatusDialog({
  projectId,
  competitionMilestoneId,
  currentStatus,
  competitionName,
  levelName,
  open,
  onOpenChange,
  onSuccess
}: EditCompetitionStatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const updateStatus = useUpdateProjectCompetitionStatus()

  const form = useForm<EditStatusFormData>({
    resolver: zodResolver(editStatusSchema),
    defaultValues: {
      statusInMilestone: currentStatus || '准备中'
    }
  })

  // 当currentStatus变化时更新表单值
  useEffect(() => {
    if (open) {
      form.reset({
        statusInMilestone: currentStatus || '准备中'
      })
    }
  }, [currentStatus, open, form])

  const onSubmit = async (data: EditStatusFormData) => {
    if (!competitionMilestoneId) {
      toast.error('缺少赛事里程碑信息')
      return
    }

    setIsSubmitting(true)
    try {
      await updateStatus.trigger({
        projectId,
        competitionMilestoneId,
        statusInMilestone: data.statusInMilestone
      })

      toast.success('赛事状态更新成功', {
        description: `项目在"${competitionName} - ${levelName}"中的状态已更新为"${data.statusInMilestone}"`
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('更新状态失败:', error)
      toast.error('更新赛事状态失败', {
        description: error instanceof Error ? error.message : '请检查网络连接后重试'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-500" />
            编辑赛事状态
          </DialogTitle>
          <DialogDescription>
            更新项目在 "{competitionName} - {levelName}" 中的参与状态
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="statusInMilestone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>项目状态 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择项目状态" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {competitionStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  status.value === '已获奖'
                                    ? 'bg-yellow-500'
                                    : status.value === '已完成' || status.value === '已提交'
                                      ? 'bg-green-500'
                                      : status.value === '进行中'
                                        ? 'bg-blue-500'
                                        : status.value === '准备中'
                                          ? 'bg-gray-500'
                                          : status.value === '未获奖'
                                            ? 'bg-orange-500'
                                            : 'bg-red-500'
                                }`}
                              />
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>选择项目在该赛事里程碑中的当前状态</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </motion.div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                更新中...
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                更新状态
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
