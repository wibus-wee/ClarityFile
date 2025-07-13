'use client'

import { useTranslation } from '@renderer/i18n/hooks'

export function PrivacySettings() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      {/* 数据隐私 */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">{t('settings:privacy.dataPrivacy')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('settings:privacy.dataPrivacyDescription')}
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
            <p className="text-muted-foreground">{t('settings:privacy.privacyInDevelopment')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('settings:privacy.privacyUpcomingFeatures')}
            </p>
          </div>
        </div>
      </div>

      {/* 可见性设置 */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">{t('settings:privacy.visibilitySettings')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('settings:privacy.visibilityDescription')}
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
            <p className="text-muted-foreground">{t('settings:privacy.visibilityInDevelopment')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('settings:privacy.visibilityUpcomingFeatures')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
