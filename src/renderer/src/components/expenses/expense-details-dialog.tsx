import { motion } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { Separator } from '@renderer/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import {
  DollarSign,
  Calendar,
  User,
  Receipt,
  FileText,
  Download,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { cn, formatFileSize } from '@renderer/lib/utils'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 经费详情类型定义
type ExpenseDetails = {
  id: string
  itemName: string
  projectId: string | null
  applicant: string
  amount: number
  applicationDate: Date
  status: string
  reimbursementDate: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  // 发票文件信息
  invoiceFileName: string | null
  invoiceOriginalFileName: string | null
  invoicePhysicalPath: string | null
  invoiceMimeType: string | null
  invoiceFileSizeBytes: number | null
  invoiceUploadedAt: Date | null
}

interface ExpenseDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: ExpenseDetails | null
  onEdit?: (expense: ExpenseDetails) => void
  onDelete?: (expense: ExpenseDetails) => void
}

export function ExpenseDetailsDialog({
  open,
  onOpenChange,
  expense,
  onEdit,
  onDelete
}: ExpenseDetailsDialogProps) {
  if (!expense) return null

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'approved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'reimbursed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '待审核'
      case 'approved':
        return '已批准'
      case 'reimbursed':
        return '已报销'
      case 'rejected':
        return '已拒绝'
      default:
        return status
    }
  }

  const handleDownloadInvoice = () => {
    if (expense.invoicePhysicalPath) {
      // 这里应该调用下载文件的API
      console.log('下载发票文件:', expense.invoicePhysicalPath)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            经费详情
          </DialogTitle>
          <DialogDescription>查看经费记录的详细信息</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{expense.itemName}</h3>
              <Badge className={cn('text-sm', getStatusColor(expense.status))}>
                {getStatusText(expense.status)}
              </Badge>
            </div>

            <div className="text-2xl font-bold text-primary">
              ¥{expense.amount.toLocaleString()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">申请人：</span>
                <span className="text-sm font-medium">{expense.applicant}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">申请时间：</span>
                <span className="text-sm">
                  {format(new Date(expense.applicationDate), 'PPP', { locale: zhCN })}
                </span>
              </div>

              {expense.reimbursementDate && (
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">报销时间：</span>
                  <span className="text-sm">
                    {format(new Date(expense.reimbursementDate), 'PPP', { locale: zhCN })}
                  </span>
                </div>
              )}

              {expense.projectId && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">关联项目：</span>
                  <Button asChild variant="link" size="sm" className="p-0 h-auto text-sm">
                    <Link to="/projects/$projectId" params={{ projectId: expense.projectId }}>
                      查看项目
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 备注信息 */}
          {expense.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">备注</h4>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">{expense.notes}</p>
                </div>
              </div>
            </>
          )}

          {/* 发票文件 */}
          {expense.invoiceFileName && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium">发票文件</h4>
                <div className="border rounded-lg p-4 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {expense.invoiceOriginalFileName || expense.invoiceFileName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {expense.invoiceFileSizeBytes && (
                            <span>{formatFileSize(expense.invoiceFileSizeBytes)}</span>
                          )}
                          {expense.invoiceUploadedAt && (
                            <span>
                              上传于{' '}
                              {format(new Date(expense.invoiceUploadedAt), 'PPP', { locale: zhCN })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadInvoice}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      下载
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 操作按钮 */}
          <Separator />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              创建于 {format(new Date(expense.createdAt), 'PPP', { locale: zhCN })}
              {expense.updatedAt !== expense.createdAt && (
                <span>
                  {' '}
                  · 更新于 {format(new Date(expense.updatedAt), 'PPP', { locale: zhCN })}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(expense)}>
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="sm" onClick={() => onDelete(expense)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
