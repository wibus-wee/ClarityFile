import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@clarity/shadcn/ui/button'
import { Input } from '@clarity/shadcn/ui/input'
import { Label } from '@clarity/shadcn/ui/label'
import { Textarea } from '@clarity/shadcn/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@clarity/shadcn/ui/select'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@clarity/shadcn/ui/drawer'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@clarity/shadcn/ui/form'
import { Calendar } from '@clarity/shadcn/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@clarity/shadcn/ui/popover'
import { CalendarIcon, Upload, FileText, X } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@renderer/lib/utils'
import {
  useCreateExpenseTracking,
  useUpdateExpenseTracking,
  useProjects,
  useProjectBudgetPools
} from '@renderer/hooks/use-tipc'
import { useFilePicker } from '@renderer/hooks/use-file-picker'
import { tipcClient } from '@renderer/lib/tipc-client'
import { toast } from 'sonner'
import {
  createExpenseTrackingSchema,
  type CreateExpenseTrackingInput,
  type UpdateExpenseTrackingInput,
  type ExpenseStatus
} from '@main/types/expense-schemas'

// 表单验证Schema - 使用创建schema作为基础表单schema
const expenseFormSchema = createExpenseTrackingSchema

type ExpenseFormData = z.infer<typeof expenseFormSchema>

interface ExpenseFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  projectId?: string // 创建时可选，编辑时从expense获取
  expense?: {
    id: string
    itemName: string
    applicant: string
    amount: number
    applicationDate: Date
    status: string
    budgetPoolId?: string | null
    reimbursementDate?: Date | null
    notes?: string | null
    projectId: string | null
    // 发票文件信息
    invoiceFileName?: string | null
    invoiceOriginalFileName?: string | null
    invoicePhysicalPath?: string | null
    invoiceMimeType?: string | null
    invoiceFileSizeBytes?: number | null
    invoiceUploadedAt?: Date | null
  } | null
  // 新增：预填充数据支持
  prefilledData?: {
    itemName?: string
    applicant?: string
    amount?: number
    notes?: string
  }
  // 新增：预选择文件支持
  preselectedFile?: {
    path: string
    name: string
    size: number
    type: string
    extension: string
  }
  onSuccess?: () => void
}

export function ExpenseFormDrawer({
  open,
  onOpenChange,
  mode,
  projectId,
  expense,
  prefilledData,
  preselectedFile,
  onSuccess
}: ExpenseFormDrawerProps) {
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [existingInvoiceFile, setExistingInvoiceFile] = useState<{
    fileName: string
    originalFileName: string
    filePath: string
  } | null>(null)

  // 表单初始化
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      projectId: projectId || '',
      budgetPoolId: '',
      itemName: '',
      applicant: '',
      amount: 0,
      status: 'pending',
      applicationDate: new Date(),
      reimbursementDate: undefined,
      notes: ''
    }
  })

  const { trigger: createExpense, isMutating: isCreating } = useCreateExpenseTracking()
  const { trigger: updateExpense, isMutating: isUpdating } = useUpdateExpenseTracking()
  const { data: projects } = useProjects()
  const { pickFile } = useFilePicker()

  // 监听表单中的 projectId 变化，以便动态获取对应的经费池数据
  const watchedProjectId = form.watch('projectId')
  const { data: budgetPools } = useProjectBudgetPools(
    watchedProjectId || expense?.projectId || null
  )

  const isMutating = isCreating || isUpdating

  // 当expense变化时更新表单数据（编辑模式）
  useEffect(() => {
    if (mode === 'edit' && expense) {
      form.reset({
        projectId: expense.projectId || '',
        budgetPoolId: expense.budgetPoolId || '',
        itemName: expense.itemName,
        applicant: expense.applicant,
        amount: expense.amount,
        status: expense.status as ExpenseStatus,
        applicationDate: new Date(expense.applicationDate),
        reimbursementDate: expense.reimbursementDate
          ? new Date(expense.reimbursementDate)
          : undefined,
        notes: expense.notes || ''
      })

      // 设置已存在的发票文件信息
      if (expense.invoiceFileName && expense.invoicePhysicalPath) {
        setExistingInvoiceFile({
          fileName: expense.invoiceFileName,
          originalFileName: expense.invoiceOriginalFileName || expense.invoiceFileName,
          filePath: expense.invoicePhysicalPath
        })
      } else {
        setExistingInvoiceFile(null)
      }

      // 清空新选择的文件
      setSelectedFile('')
    } else if (mode === 'create') {
      form.reset({
        projectId: projectId || '',
        budgetPoolId: '',
        itemName: prefilledData?.itemName || '',
        applicant: prefilledData?.applicant || '',
        amount: prefilledData?.amount || 0,
        status: 'pending',
        applicationDate: new Date(),
        reimbursementDate: undefined,
        notes: prefilledData?.notes || ''
      })
      setExistingInvoiceFile(null)

      // 如果有预选择的文件，设置为选中状态
      if (preselectedFile) {
        setSelectedFile(preselectedFile.path)
        setExistingInvoiceFile({
          fileName: preselectedFile.name,
          originalFileName: preselectedFile.name,
          filePath: preselectedFile.path
        })
      } else {
        setSelectedFile('')
      }
    }
  }, [mode, expense, projectId, prefilledData, preselectedFile, form])

  // 当用户选择项目时，重置经费池选择
  // 因为不同项目的经费池不同，之前选择的经费池可能不适用于新项目
  useEffect(() => {
    if (watchedProjectId) {
      // 在创建模式下，或者在编辑模式下项目发生变化时，重置经费池选择
      if (
        mode === 'create' ||
        (mode === 'edit' && expense && watchedProjectId !== expense.projectId)
      ) {
        form.setValue('budgetPoolId', '')
      }
    }
  }, [watchedProjectId, mode, form, expense])

  // 处理文件选择
  const handleSelectFile = async () => {
    try {
      // 使用前端原生文件选择器，支持 PDF 和图片格式
      const result = await pickFile('.pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp')

      if (!result.canceled && result.path) {
        setSelectedFile(result.path)
        toast.success('文件选择成功！')
      }
    } catch (error) {
      console.error('选择文件失败:', error)
      toast.error('选择文件失败')
    }
  }

  // 上传发票文件
  const uploadInvoiceFile = async (
    filePath: string,
    formData: ExpenseFormData
  ): Promise<string | null> => {
    try {
      const importResult = await tipcClient.importFile({
        sourcePath: filePath,
        projectId: formData.projectId,
        importType: 'expense',
        originalFileName: filePath.split('/').pop() || '',
        displayName: `发票_${formData.itemName}_${new Date().toLocaleDateString()}`,
        expenseDescription: formData.itemName,
        applicantName: formData.applicant,
        preserveOriginalName: false
      })

      if (importResult.success && importResult.managedFileId) {
        return importResult.managedFileId
      } else {
        throw new Error(`文件上传失败: ${importResult.errors?.join(', ')}`)
      }
    } catch (error) {
      console.error('上传发票文件失败:', error)
      throw error
    }
  }

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      let invoiceManagedFileId: string | null = null

      // 如果选择了发票文件，先上传
      if (selectedFile && selectedFile.trim()) {
        invoiceManagedFileId = await uploadInvoiceFile(selectedFile, data)
      }

      if (mode === 'create') {
        await createExpense({
          projectId: data.projectId,
          budgetPoolId: data.budgetPoolId,
          itemName: data.itemName,
          applicant: data.applicant,
          amount: data.amount,
          applicationDate: data.applicationDate,
          status: data.status,
          reimbursementDate: data.reimbursementDate,
          notes: data.notes,
          invoiceManagedFileId
        } as CreateExpenseTrackingInput)

        toast.success('经费记录创建成功')
      } else if (expense) {
        await updateExpense({
          id: expense.id,
          projectId: data.projectId,
          budgetPoolId: data.budgetPoolId,
          itemName: data.itemName,
          applicant: data.applicant,
          amount: data.amount,
          applicationDate: data.applicationDate,
          status: data.status,
          reimbursementDate: data.reimbursementDate,
          notes: data.notes,
          invoiceManagedFileId
        } as UpdateExpenseTrackingInput)

        toast.success('经费记录更新成功')
      }

      onOpenChange(false)
      onSuccess?.()

      // 重置表单和文件选择
      if (mode === 'create') {
        form.reset()
        setSelectedFile('')
      }
    } catch (error) {
      toast.error(mode === 'create' ? '创建失败，请重试' : '更新失败，请重试')
      console.error(`${mode === 'create' ? '创建' : '更新'}经费记录失败:`, error)
    }
  }

  const getTitle = () => (mode === 'create' ? '添加新报销' : '编辑经费记录')
  const getDescription = () => (mode === 'create' ? '创建新的经费报销记录' : '修改经费报销记录信息')
  const getSubmitText = () => {
    if (isMutating) {
      return mode === 'create' ? '创建中...' : '更新中...'
    }
    return mode === 'create' ? '创建' : '更新'
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{getTitle()}</DrawerTitle>
          <DrawerDescription>{getDescription()}</DrawerDescription>
        </DrawerHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 overflow-y-auto"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 项目选择（在创建模式且未指定项目时显示，或在编辑模式下显示） */}
              {(mode === 'create' && !projectId) || mode === 'edit' ? (
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>关联项目 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择项目" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects?.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {/* 经费池选择 */}
              <FormField
                control={form.control}
                name="budgetPoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>经费池 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择经费池" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {budgetPools?.map((pool) => (
                          <SelectItem key={pool.id} value={pool.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{pool.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                剩余: ¥{(pool.statistics?.remainingAmount || 0).toLocaleString()}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="itemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>报销项目 *</FormLabel>
                      <FormControl>
                        <Input placeholder="如：购买打印机" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>申请人 *</FormLabel>
                      <FormControl>
                        <Input placeholder="申请人姓名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>金额 *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>状态</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">待审核</SelectItem>
                          <SelectItem value="approved">已批准</SelectItem>
                          <SelectItem value="reimbursed">已报销</SelectItem>
                          <SelectItem value="rejected">已拒绝</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="applicationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>申请时间</FormLabel>
                      <Popover>
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
                              {field.value ? (
                                format(field.value, 'PPP', { locale: zhCN })
                              ) : (
                                <span>选择日期</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reimbursementDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>报销时间</FormLabel>
                      <Popover>
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
                              {field.value ? (
                                format(field.value, 'PPP', { locale: zhCN })
                              ) : (
                                <span>选择日期（可选）</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>备注</FormLabel>
                    <FormControl>
                      <Textarea placeholder="添加备注信息..." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 发票文件上传 */}
              <div className="space-y-2">
                <Label>发票文件</Label>

                {/* 显示已存在的发票文件 */}
                {existingInvoiceFile && !selectedFile && (
                  <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {existingInvoiceFile.originalFileName}
                          </span>
                          <span className="text-xs text-muted-foreground">已上传的发票文件</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSelectFile}
                        >
                          更换文件
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setExistingInvoiceFile(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 显示新选择的文件 */}
                {selectedFile && selectedFile.trim() && (
                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {selectedFile.split('/').pop()}
                          </span>
                          <span className="text-xs text-muted-foreground">新选择的文件</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile('')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* 文件选择区域 */}
                {!existingInvoiceFile && !selectedFile && (
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                    onClick={handleSelectFile}
                  >
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">点击选择发票文件</p>
                    <p className="text-xs text-muted-foreground mt-1">支持 PDF、图片等格式</p>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </motion.div>

        <DrawerFooter>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isMutating}>
            {getSubmitText()}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
