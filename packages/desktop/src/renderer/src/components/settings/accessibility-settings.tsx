'use client'

import { useTranslation } from '@renderer/i18n/hooks'

export function AccessibilitySettings() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      {/* 无障碍功能 */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">{t('settings:accessibility.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('settings:accessibility.description')}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
            <p className="text-muted-foreground">{t('settings:accessibility.inDevelopment')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('settings:accessibility.upcomingFeatures')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
