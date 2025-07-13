'use client'

import { useEffect, ReactNode, useState } from 'react'
import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

import { Button } from '@clarity/shadcn/ui/button'
import { Form } from '@clarity/shadcn/ui/form'
import { useSettingsByCategory, useSetSetting } from '@renderer/hooks/use-tipc'
import { Shortcut } from '@renderer/components/shortcuts'

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

  // 保存状态管理
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success'>('idle')

  const form = useForm<T>({
    resolver: zodResolver(schema as any),
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
      setSaveState('saving')

      if (onSubmit) {
        await onSubmit(data)
      } else if (mapFormDataToSettings) {
        const settingsToSave = mapFormDataToSettings(data)

        for (const setting of settingsToSave) {
          await setSetting(setting)
        }
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
      }

      // 保存成功
      setSaveState('success')

      // 2秒后重置状态
      setTimeout(() => {
        setSaveState('idle')
      }, 2000)
    } catch (error) {
      console.error('保存设置失败:', error)
      toast.error('保存设置失败')
      setSaveState('idle')
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
            <motion.div
              animate={{
                width: saveState === 'saving' ? 120 : saveState === 'success' ? 120 : 120
              }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              className="overflow-hidden"
            >
              <Shortcut shortcut={['cmd', 's']} description="保存设置" showTooltip={false}>
                <Button type="submit" className="px-8 w-full" disabled={saveState === 'saving'}>
                  <AnimatePresence mode="wait">
                    {saveState === 'saving' && (
                      <motion.span
                        key="saving"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        保存中...
                      </motion.span>
                    )}
                    {saveState === 'success' && (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.4, 0.0, 0.2, 1]
                        }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        已保存
                      </motion.span>
                    )}
                    {saveState === 'idle' && (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {submitButtonText}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </Shortcut>
            </motion.div>
          </div>
        </form>
      </Form>
    </div>
  )
}
