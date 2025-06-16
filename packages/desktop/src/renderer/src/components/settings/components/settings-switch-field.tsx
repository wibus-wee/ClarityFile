'use client'

import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@renderer/components/ui/form'
import { Switch } from '@renderer/components/ui/switch'
import { Separator } from '@renderer/components/ui/separator'

interface SettingsSwitchFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  className?: string
  showSeparator?: boolean
}

export function SettingsSwitchField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className = 'flex flex-row items-center justify-between py-2',
  showSeparator = true
}: SettingsSwitchFieldProps<T>) {
  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className={className}>
            <div className="space-y-0.5">
              <FormLabel className="text-base">{label}</FormLabel>
              {description && <FormDescription>{description}</FormDescription>}
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {showSeparator && <Separator />}
    </>
  )
}
