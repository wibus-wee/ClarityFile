'use client'

import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { FolderOpen } from 'lucide-react'
import { useSelectDirectory } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'

interface SettingsInputFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  placeholder?: string
  type?: string
  min?: string
  max?: string
  className?: string
  onChange?: (value: any) => any
}

export function SettingsInputField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  type = 'text',
  min,
  max,
  className,
  onChange
}: SettingsInputFieldProps<T>) {
  const { trigger: selectDirectory, isMutating: isSelectingDirectory } = useSelectDirectory()

  const handleSelectDirectory = async (field: any) => {
    try {
      const result = await selectDirectory({
        title: '选择默认项目路径',
        defaultPath: field.value || undefined
      })

      if (!result.canceled && result.path) {
        field.onChange(result.path)
        toast.success('文件夹选择成功')
      }
    } catch (error) {
      console.error('选择文件夹失败:', error)
      toast.error('选择文件夹失败')
    }
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {type === 'directory' ? (
              <div className="flex gap-2">
                <Input
                  placeholder={placeholder}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value
                    const finalValue = onChange ? onChange(value) : value
                    field.onChange(finalValue)
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectDirectory(field)}
                  disabled={isSelectingDirectory}
                  className="px-3"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Input
                type={type}
                min={min}
                max={max}
                placeholder={placeholder}
                {...field}
                onChange={(e) => {
                  const value = type === 'number' ? parseInt(e.target.value) : e.target.value
                  const finalValue = onChange ? onChange(value) : value
                  field.onChange(finalValue)
                }}
              />
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
        </FormItem>
      )}
    />
  )
}
