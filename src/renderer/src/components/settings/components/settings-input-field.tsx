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
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
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
          </FormControl>
          {description && (
            <FormDescription>{description}</FormDescription>
          )}
        </FormItem>
      )}
    />
  )
}
