import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@clarity/shadcn/ui/drawer'
import { Button } from '@clarity/shadcn/ui/button'
import { Input } from '@clarity/shadcn/ui/input'
import { Textarea } from '@clarity/shadcn/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@clarity/shadcn/ui/form'
import { Trophy, Loader2, Plus, Edit } from 'lucide-react'
import { useCreateCompetitionSeries, useUpdateCompetitionSeries } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import {
  createCompetitionSeriesSchema,
  updateCompetitionSeriesSchema
} from '@main/types/competition-schemas'
import type {
  CreateCompetitionSeriesInput,
  UpdateCompetitionSeriesInput,
  CompetitionSeriesWithStatsOutput
} from '@main/types/competition-schemas'

interface CompetitionSeriesDrawerProps {
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

export function CompetitionSeriesDrawer({
  open,
  onOpenChange,
  series,
  onSuccess
}: CompetitionSeriesDrawerProps) {
  const isEdit = !!series
  const { trigger: createSeries, isMutating: isCreating } = useCreateCompetitionSeries()
  const { trigger: updateSeries, isMutating: isUpdating } = useUpdateCompetitionSeries()

  const isMutating = isCreating || isUpdating

  const form = useForm<SeriesFormData>({
    // 使用 any 是因为这个地方是 multi-schema mode, edit mode need id prop
    // but create mode not need id prop
    resolver: zodResolver(getFormSchema(isEdit) as any),
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

      // 关闭抽屉
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isEdit ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-primary/10'
              }`}
            >
              {isEdit ? (
                <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Trophy className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <DrawerTitle className="text-xl">
                {isEdit ? '编辑赛事系列' : '创建赛事系列'}
              </DrawerTitle>
              <DrawerDescription className="text-sm">
                {isEdit ? '修改赛事系列的基本信息' : '创建一个新的赛事系列来管理相关比赛'}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 overflow-y-auto"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      赛事系列名称将用于组织和管理相关比赛 ({field.value?.length || 0}/100 字符)
                    </p>
                  </FormItem>
                )}
              />

              {/* 描述 */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="描述这个赛事系列的背景、目标或特点..."
                        rows={4}
                        maxLength={500}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      可选，帮助您和团队成员了解赛事系列的背景和目标 ({field.value?.length || 0}/500
                      字符)
                    </p>
                  </FormItem>
                )}
              />

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-4 border-t">
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
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isEdit ? '更新中...' : '创建中...'}
                    </>
                  ) : (
                    <>
                      {isEdit ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {isEdit ? '更新系列' : '创建系列'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </DrawerContent>
    </Drawer>
  )
}
