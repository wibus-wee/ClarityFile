'use client'

import { useEffect, ReactNode } from 'react'
import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@renderer/components/ui/button'
import { Form } from '@renderer/components/ui/form'
import { useSettingsByCategory, useSetSetting } from '@renderer/hooks/use-tipc'

interface SettingItem {
  key: string
  value: any
  category: string
  description: string
}

interface SettingsFormProps<T extends FieldValues> {
  category: string
  schema: z.ZodSchema<T>
  defaultValues: DefaultValues<T>
  children: (form: UseFormReturn<T>) => ReactNode
  onSubmit?: (data: T) => Promise<void>
  submitButtonText?: string
  className?: string
  mapFormDataToSettings?: (data: T) => SettingItem[]
}

export function SettingsForm<T extends FieldValues>({
  category,
  schema,
  defaultValues,
  children,
  onSubmit,
  submitButtonText = '保存设置',
  className = 'space-y-8',
  mapFormDataToSettings
}: SettingsFormProps<T>) {
  const { data: settings, isLoading } = useSettingsByCategory(category)
  const { trigger: setSetting } = useSetSetting()

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues
  })

  // 从数据库加载设置
  useEffect(() => {
    if (settings) {
      const settingsMap = new Map(settings.map((s) => [s.key, JSON.parse(s.value as string)]))
      
      // 创建新的值对象，只包含 schema 中定义的字段
      const newValues: Partial<T> = {}
      
      // 遍历 defaultValues 的键来确定需要设置的字段
      Object.keys(defaultValues as object).forEach((key) => {
        const settingKey = `${category}.${key}`
        const value = settingsMap.get(settingKey)
        if (value !== undefined) {
          ;(newValues as any)[key] = value
        }
      })
      
      form.reset({ ...defaultValues, ...newValues } as DefaultValues<T>)
    }
  }, [settings, form, category, defaultValues])

  const handleSubmit = async (data: T) => {
    try {
      if (onSubmit) {
        await onSubmit(data)
      } else if (mapFormDataToSettings) {
        const settingsToSave = mapFormDataToSettings(data)
        
        for (const setting of settingsToSave) {
          await setSetting(setting)
        }
        
        toast.success(`${category}设置已保存`)
      } else {
        // 默认行为：将所有表单字段保存为设置
        const settingsToSave: SettingItem[] = Object.entries(data).map(([key, value]) => ({
          key: `${category}.${key}`,
          value,
          category,
          description: key
        }))
        
        for (const setting of settingsToSave) {
          await setSetting(setting)
        }
        
        toast.success(`${category}设置已保存`)
      }
    } catch (error) {
      console.error('保存设置失败:', error)
      toast.error('保存设置失败')
    }
  }

  if (isLoading) {
    return <div>加载中...</div>
  }

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {children(form)}
          
          <div className="flex justify-end">
            <Button type="submit" className="px-8">
              {submitButtonText}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
