import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
import { Label } from '@renderer/components/ui/label'
import { Edit, Loader2 } from 'lucide-react'
import { useUpdateCompetitionSeries } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import type { UpdateCompetitionSeriesInput } from '../../../../../main/types/inputs'
import type { CompetitionSeriesWithStatsOutput } from '../../../../../main/types/outputs'

interface EditCompetitionSeriesDialogProps {
  series: CompetitionSeriesWithStatsOutput | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormData {
  name: string
  description: string
}

export function EditCompetitionSeriesDialog({
  series,
  isOpen,
  onOpenChange,
  onSuccess
}: EditCompetitionSeriesDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: ''
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const { trigger: updateSeries, isMutating } = useUpdateCompetitionSeries()

  // 当系列数据变化时更新表单
  useEffect(() => {
    if (series) {
      setFormData({
        name: series.name,
        description: series.notes || ''
      })
      setErrors({})
    }
  }, [series])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = '赛事系列名称不能为空'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '赛事系列名称至少需要2个字符'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = '赛事系列名称不能超过100个字符'
    }

    if (formData.description.trim().length > 500) {
      newErrors.description = '描述不能超过500个字符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!series || !validateForm()) {
      return
    }

    try {
      const input: UpdateCompetitionSeriesInput = {
        id: series.id,
        name: formData.name.trim(),
        notes: formData.description.trim() || undefined
      }

      await updateSeries(input)

      toast.success('赛事系列更新成功', {
        description: `"${formData.name}" 已成功更新`
      })

      // 关闭对话框
      onOpenChange(false)

      // 调用成功回调
      onSuccess?.()
    } catch (error) {
      console.error('更新赛事系列失败:', error)
      toast.error('更新赛事系列失败', {
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    }
  }

  const handleCancel = () => {
    if (series) {
      setFormData({
        name: series.name,
        description: series.notes || ''
      })
    }
    setErrors({})
    onOpenChange(false)
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // 清除对应字段的错误
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (!series) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Edit className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>编辑赛事系列</DialogTitle>
              <DialogDescription>修改赛事系列的基本信息</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* 赛事系列名称 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              赛事系列名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="例如：全国大学生创新创业大赛"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
              maxLength={100}
            />
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive"
              >
                {errors.name}
              </motion.p>
            )}
            <p className="text-xs text-muted-foreground">{formData.name.length}/100 字符</p>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              描述（可选）
            </Label>
            <Textarea
              id="description"
              placeholder="描述这个赛事系列的背景、目标或特点..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={
                errors.description ? 'border-destructive focus-visible:ring-destructive' : ''
              }
              rows={3}
              maxLength={500}
            />
            {errors.description && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive"
              >
                {errors.description}
              </motion.p>
            )}
            <p className="text-xs text-muted-foreground">{formData.description.length}/500 字符</p>
          </div>

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
              disabled={isMutating || !formData.name.trim()}
              className="flex-1 gap-2"
            >
              {isMutating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  更新中...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  更新赛事系列
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}
