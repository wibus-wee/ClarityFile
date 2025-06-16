'use client'

import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@clarity/shadcn/ui/form'
import { RadioGroup, RadioGroupItem } from '@clarity/shadcn/ui/radio-group'
import { Label } from '@clarity/shadcn/ui/label'

interface RadioOption {
  value: string
  label: string
  description?: string
}

interface SettingsRadioFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  options: RadioOption[]
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function SettingsRadioField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  className,
  orientation = 'vertical'
}: SettingsRadioFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className={
                orientation === 'horizontal' ? 'flex flex-row space-x-4' : 'flex flex-col space-y-2'
              }
            >
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={`${name}-${option.value}`}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.label}
                    </Label>
                    {option.description && (
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
        </FormItem>
      )}
    />
  )
}
