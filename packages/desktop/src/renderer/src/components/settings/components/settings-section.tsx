'use client'

import { ReactNode } from 'react'
import { Separator } from '@clarity/shadcn/ui/separator'

interface SettingsSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  showSeparator?: boolean
}

export function SettingsSection({
  title,
  description,
  children,
  className = 'space-y-6',
  showSeparator = true
}: SettingsSectionProps) {
  return (
    <>
      <div className={className}>
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>

        <div className="space-y-4">{children}</div>
      </div>

      {showSeparator && <Separator />}
    </>
  )
}
