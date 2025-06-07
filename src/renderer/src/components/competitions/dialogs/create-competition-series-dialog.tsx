import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
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
import { Trophy, Loader2 } from 'lucide-react'
import { useCreateCompetitionSeries } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { createCompetitionSeriesSchema } from '../../../../../main/types/competition-schemas'
import type { CreateCompetitionSeriesInput } from '../../../../../main/types/competition-schemas'

interface CreateCompetitionSeriesDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// 使用统一的 zod Schema
type CompetitionSeriesFormData = z.infer<typeof createCompetitionSeriesSchema>

export function CreateCompetitionSeriesDialog({
  isOpen,
  onOpenChange,
  onSuccess
}: CreateCompetitionSeriesDialogProps) {
  const { trigger: createSeries, isMutating } = useCreateCompetitionSeries()

  const form = useForm<CompetitionSeriesFormData>({
    resolver: zodResolver(createCompetitionSeriesSchema),
    defaultValues: {
      name: '',
      notes: ''
    }
  })

  const onSubmit = async (data: CompetitionSeriesFormData) => {
    try {
      const input: CreateCompetitionSeriesInput = {
        name: data.name.trim(),
        notes: data.notes?.trim() || undefined
      }

      await createSeries(input)

      toast.success('赛事系列创建成功', {
        description: `"${data.name}" 已成功创建`
      })

      // 重置表单
      form.reset()

      // 关闭对话框
      onOpenChange(false)

      // 调用成功回调
      onSuccess?.()
    } catch (error) {
      console.error('创建赛事系列失败:', error)
      toast.error('创建赛事系列失败', {
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>创建赛事系列</DialogTitle>
              <DialogDescription>创建一个新的赛事系列来组织相关的赛事里程碑</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* 赛事系列名称 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    赛事系列名称 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="例如：全国大学生创新创业大赛" maxLength={100} {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">{field.value.length}/100 字符</p>
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
                      placeholder="描述这个赛事系列的背景、目标或特点..."
                      rows={3}
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    {field.value?.length || 0}/500 字符
                  </p>
                </FormItem>
              )}
            />

            {/* 操作按钮 */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isMutating}
                className="flex-1"
              >
                取消
              </Button>

              <Button type="submit" disabled={isMutating} className="flex-1 gap-2">
                {isMutating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4" />
                    创建赛事系列
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
