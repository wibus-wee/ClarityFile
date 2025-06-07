import { useEffect } from 'react'
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
import { Trophy, Loader2, Plus, Edit } from 'lucide-react'
import { 
  useCreateCompetitionSeries,
  useUpdateCompetitionSeries 
} from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { 
  createCompetitionSeriesSchema,
  updateCompetitionSeriesSchema 
} from '../../../../../main/types/competition-schemas'
import type { 
  CreateCompetitionSeriesInput,
  UpdateCompetitionSeriesInput,
  CompetitionSeriesWithStatsOutput 
} from '../../../../../main/types/competition-schemas'

interface CompetitionSeriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  series?: CompetitionSeriesWithStatsOutput | null // 编辑时传入，创建时为空
  onSuccess?: () => void
}

// 根据模式选择合适的 Schema
const getFormSchema = (isEdit: boolean) => 
  isEdit ? updateCompetitionSeriesSchema : createCompetitionSeriesSchema

type SeriesFormData = z.infer<typeof createCompetitionSeriesSchema> & 
  Partial<z.infer<typeof updateCompetitionSeriesSchema>>

export function CompetitionSeriesDialog({
  open,
  onOpenChange,
  series,
  onSuccess
}: CompetitionSeriesDialogProps) {
  const isEdit = !!series
  const { trigger: createSeries, isMutating: isCreating } = useCreateCompetitionSeries()
  const { trigger: updateSeries, isMutating: isUpdating } = useUpdateCompetitionSeries()
  
  const isMutating = isCreating || isUpdating

  const form = useForm<SeriesFormData>({
    resolver: zodResolver(getFormSchema(isEdit)),
    defaultValues: {
      name: '',
      notes: '',
      ...(isEdit && { id: '' })
    }
  })

  // 当系列数据变化时更新表单
  useEffect(() => {
    if (series) {
      // 编辑模式
      form.reset({
        id: series.id,
        name: series.name,
        notes: series.notes || ''
      })
    } else {
      // 创建模式
      form.reset({
        name: '',
        notes: ''
      })
    }
  }, [series, form])

  const onSubmit = async (data: SeriesFormData) => {
    try {
      if (isEdit && series) {
        // 编辑模式
        const input: UpdateCompetitionSeriesInput = {
          id: series.id,
          name: data.name?.trim(),
          notes: data.notes?.trim() || undefined
        }
        await updateSeries(input)
        
        toast.success('赛事系列更新成功', {
          description: `"${data.name}" 已成功更新`
        })
      } else {
        // 创建模式
        const input: CreateCompetitionSeriesInput = {
          name: data.name!.trim(),
          notes: data.notes?.trim() || undefined
        }
        await createSeries(input)
        
        toast.success('赛事系列创建成功', {
          description: `"${data.name}" 已成功创建`
        })
      }

      // 重置表单
      form.reset()
      
      // 关闭对话框
      onOpenChange(false)
      
      // 调用成功回调
      onSuccess?.()
    } catch (error) {
      console.error(`${isEdit ? '更新' : '创建'}赛事系列失败:`, error)
      toast.error(`${isEdit ? '更新' : '创建'}赛事系列失败`, {
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {isEdit ? '编辑赛事系列' : '创建赛事系列'}
              </DialogTitle>
              <DialogDescription>
                {isEdit ? '修改赛事系列的基本信息' : '创建一个新的赛事系列来管理相关比赛'}
              </DialogDescription>
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
                    <Input
                      placeholder="例如：全国大学生创新创业大赛"
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">{field.value?.length || 0}/100 字符</p>
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
                  <p className="text-xs text-muted-foreground">{field.value?.length || 0}/500 字符</p>
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

              <Button
                type="submit"
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
                    {isEdit ? '更新系列' : '创建系列'}
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
