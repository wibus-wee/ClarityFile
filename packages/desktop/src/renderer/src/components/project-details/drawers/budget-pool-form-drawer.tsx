import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@renderer/components/ui/drawer'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import { DollarSign, PieChart } from 'lucide-react'
import { useCreateBudgetPool, useUpdateBudgetPool } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import {
  createBudgetPoolSchema,
  type CreateBudgetPoolInput,
  type UpdateBudgetPoolInput
} from '@main/types/budget-pool-schemas'

// 表单验证Schema
const budgetPoolFormSchema = createBudgetPoolSchema.omit({ projectId: true })

type BudgetPoolFormData = z.infer<typeof budgetPoolFormSchema>

interface BudgetPoolFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  projectId: string
  budgetPool?: {
    id: string
    name: string
    budgetAmount: number
    description?: string | null
  } | null
  onSuccess?: () => void
}

export function BudgetPoolFormDrawer({
  open,
  onOpenChange,
  mode,
  projectId,
  budgetPool,
  onSuccess
}: BudgetPoolFormDrawerProps) {
  const { trigger: createBudgetPool, isMutating: isCreating } = useCreateBudgetPool()
  const { trigger: updateBudgetPool, isMutating: isUpdating } = useUpdateBudgetPool()

  const isMutating = isCreating || isUpdating

  // 表单初始化
  const form = useForm<BudgetPoolFormData>({
    resolver: zodResolver(budgetPoolFormSchema),
    defaultValues: {
      name: '',
      budgetAmount: 0,
      description: ''
    }
  })

  // 当budgetPool变化时更新表单数据（编辑模式）
  useEffect(() => {
    if (mode === 'edit' && budgetPool) {
      form.reset({
        name: budgetPool.name,
        budgetAmount: budgetPool.budgetAmount,
        description: budgetPool.description || ''
      })
    } else if (mode === 'create') {
      form.reset({
        name: '',
        budgetAmount: 0,
        description: ''
      })
    }
  }, [mode, budgetPool, form])

  const onSubmit = async (data: BudgetPoolFormData) => {
    try {
      if (mode === 'create') {
        await createBudgetPool({
          projectId,
          name: data.name,
          budgetAmount: data.budgetAmount,
          description: data.description || undefined
        } as CreateBudgetPoolInput)

        toast.success('经费池创建成功')
      } else if (budgetPool) {
        await updateBudgetPool({
          id: budgetPool.id,
          name: data.name,
          budgetAmount: data.budgetAmount,
          description: data.description || undefined
        } as UpdateBudgetPoolInput)

        toast.success('经费池更新成功')
      }

      onOpenChange(false)
      onSuccess?.()

      // 重置表单
      if (mode === 'create') {
        form.reset()
      }
    } catch (error) {
      toast.error(mode === 'create' ? '创建失败，请重试' : '更新失败，请重试')
      console.error(`${mode === 'create' ? '创建' : '更新'}经费池失败:`, error)
    }
  }

  const getTitle = () => (mode === 'create' ? '创建经费池' : '编辑经费池')
  const getDescription = () => (mode === 'create' ? '为项目创建新的经费池' : '修改经费池信息')
  const getSubmitText = () => {
    if (isMutating) {
      return mode === 'create' ? '创建中...' : '更新中...'
    }
    return mode === 'create' ? '创建' : '更新'
  }

  // 格式化金额显示
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const watchedAmount = form.watch('budgetAmount')

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            {getTitle()}
          </DrawerTitle>
          <DrawerDescription>{getDescription()}</DrawerDescription>
        </DrawerHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 overflow-y-auto"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>经费池名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：攀登计划、创新创业计划" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>预算金额 *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    {watchedAmount > 0 && (
                      <div className="text-sm text-muted-foreground">
                        预算金额：{formatCurrency(watchedAmount)}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea placeholder="经费池的用途和说明..." rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 预算提示信息 */}
              {mode === 'create' && watchedAmount > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        预算分配提示
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        此经费池将分配 {formatCurrency(watchedAmount)} 的预算。
                        请确保总预算分配合理，避免超出项目整体预算。
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </motion.div>

        <DrawerFooter>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              取消
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isMutating} className="flex-1">
              {getSubmitText()}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
