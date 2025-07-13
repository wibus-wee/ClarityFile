'use client'

import { useTranslation } from 'react-i18next'

export function PrivacySettings() {
  const { t } = useTranslation('settings')

  return (
    <div className="space-y-8">
      {/* 数据隐私 */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">{t('privacy.dataPrivacy')}</h3>
          <p className="text-sm text-muted-foreground">{t('privacy.dataPrivacyDescription')}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
            <p className="text-muted-foreground">{t('privacy.privacyInDevelopment')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('privacy.privacyUpcomingFeatures')}
            </p>
          </div>
        </div>
      </div>

      {/* 可见性设置 */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">{t('privacy.visibilitySettings')}</h3>
          <p className="text-sm text-muted-foreground">{t('privacy.visibilityDescription')}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
            <p className="text-muted-foreground">{t('privacy.visibilityInDevelopment')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('privacy.visibilityUpcomingFeatures')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
