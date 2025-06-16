'use client'

import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@clarity/shadcn/ui/form'
import { Slider } from '@clarity/shadcn/ui/slider'

interface SettingsSliderFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  min?: number
  max?: number
  step?: number
  className?: string
  showValue?: boolean
  formatValue?: (value: number) => string
}

export function SettingsSliderField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  min = 0,
  max = 100,
  step = 1,
  className,
  showValue = true,
  formatValue = (value) => value.toString()
}: SettingsSliderFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex items-center justify-between">
            <FormLabel>{label}</FormLabel>
            {showValue && (
              <span className="text-sm text-muted-foreground">{formatValue(field.value)}</span>
            )}
          </div>
          <FormControl>
            <Slider
              min={min}
              max={max}
              step={step}
              value={[field.value]}
              onValueChange={(value) => field.onChange(value[0])}
              className="w-full"
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
        </FormItem>
      )}
    />
  )
}
