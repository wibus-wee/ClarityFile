import { z } from 'zod'

// ===== 经费追踪相关 Schema =====

// 经费状态枚举
export const expenseStatusSchema = z.enum(['pending', 'approved', 'rejected', 'reimbursed'], {
  errorMap: () => ({ message: '请选择有效的经费状态' })
})

// 创建经费追踪 Schema
export const createExpenseTrackingSchema = z.object({
  itemName: z
    .string()
    .min(1, '请填写报销项目')
    .max(100, '报销项目名称不能超过100个字符')
    .refine((name) => name.trim().length > 0, '报销项目不能只包含空格'),
  projectId: z.string().min(1, '请选择项目'),
  budgetPoolId: z.string().min(1, '请选择经费池'),
  applicant: z
    .string()
    .min(1, '请填写申请人')
    .max(50, '申请人姓名不能超过50个字符')
    .refine((name) => name.trim().length > 0, '申请人不能只包含空格'),
  amount: z.number().positive('金额必须大于0').max(999999999, '金额不能超过999,999,999'),
  applicationDate: z.date({
    required_error: '请选择申请日期',
    invalid_type_error: '申请日期格式不正确'
  }),
  status: expenseStatusSchema,
  invoiceManagedFileId: z.string().optional(),
  reimbursementDate: z.date().optional(),
  notes: z.string().max(500, '备注不能超过500个字符').optional()
})

// 更新经费追踪 Schema
export const updateExpenseTrackingSchema = z.object({
  id: z.string().min(1, '经费记录ID不能为空'),
  projectId: z.string().min(1, '请选择项目').optional(),
  itemName: z
    .string()
    .min(1, '请填写报销项目')
    .max(100, '报销项目名称不能超过100个字符')
    .refine((name) => name.trim().length > 0, '报销项目不能只包含空格')
    .optional(),
  budgetPoolId: z.string().min(1, '请选择经费池').optional(),
  applicant: z
    .string()
    .min(1, '请填写申请人')
    .max(50, '申请人姓名不能超过50个字符')
    .refine((name) => name.trim().length > 0, '申请人不能只包含空格')
    .optional(),
  amount: z.number().positive('金额必须大于0').max(999999999, '金额不能超过999,999,999').optional(),
  applicationDate: z
    .date({
      invalid_type_error: '申请日期格式不正确'
    })
    .optional(),
  status: expenseStatusSchema.optional(),
  invoiceManagedFileId: z.string().optional(),
  reimbursementDate: z.date().optional(),
  notes: z.string().max(500, '备注不能超过500个字符').optional()
})

// 删除经费追踪 Schema
export const deleteExpenseTrackingSchema = z.object({
  id: z.string().min(1, '经费记录ID不能为空')
})

// 获取项目经费 Schema
export const getProjectExpensesSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空')
})

// 获取经费状态 Schema
export const getExpensesByStatusSchema = z.object({
  status: expenseStatusSchema
})

// ===== 输出类型 =====

// 经费记录输出类型
export interface ExpenseTrackingOutput {
  id: string
  itemName: string
  projectId: string | null
  budgetPoolId: string | null
  applicant: string
  amount: number
  applicationDate: Date
  status: string
  reimbursementDate: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  // 发票文件信息（可能为空）
  invoiceFileName: string | null
  invoiceOriginalFileName: string | null
  invoicePhysicalPath: string | null
  invoiceMimeType: string | null
  invoiceFileSizeBytes: number | null
  invoiceUploadedAt: Date | null
}

// ===== 导出类型 =====
export type CreateExpenseTrackingInput = z.infer<typeof createExpenseTrackingSchema>
export type UpdateExpenseTrackingInput = z.infer<typeof updateExpenseTrackingSchema>
export type DeleteExpenseTrackingInput = z.infer<typeof deleteExpenseTrackingSchema>
export type GetProjectExpensesInput = z.infer<typeof getProjectExpensesSchema>
export type GetExpensesByStatusInput = z.infer<typeof getExpensesByStatusSchema>
export type ExpenseStatus = z.infer<typeof expenseStatusSchema>
