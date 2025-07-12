'use client'

import { useSearch } from '@tanstack/react-router'
import { Suspense } from 'react'
import { Bell, Globe, Home, Keyboard, Lock, Paintbrush, Settings, Video } from 'lucide-react'
import { useTranslation } from '@renderer/i18n/hooks'

import { GeneralSettings } from './settings/general-settings'
import { AppearanceSettings } from './settings/appearance-settings'
import { NotificationSettings } from './settings/notification-settings'
import { AdvancedSettings } from './settings/advanced-settings'
import { LanguageSettings } from './settings/language-settings'
import { AccessibilitySettings } from './settings/accessibility-settings'
import { PrivacySettings } from './settings/privacy-settings'
import { AudioVideoSettings } from './settings/audio-video-settings'

function useSettingsCategories() {
  const { t } = useTranslation('settings')

  return [
    { id: 'general', name: t('categories.general'), icon: Home, component: GeneralSettings },
    {
      id: 'appearance',
      name: t('categories.appearance'),
      icon: Paintbrush,
      component: AppearanceSettings
    },
    {
      id: 'notifications',
      name: t('categories.notifications'),
      icon: Bell,
      component: NotificationSettings
    },
    { id: 'language', name: t('categories.language'), icon: Globe, component: LanguageSettings },
    {
      id: 'accessibility',
      name: t('categories.accessibility'),
      icon: Keyboard,
      component: AccessibilitySettings
    },
    {
      id: 'audio-video',
      name: t('categories.audioVideo'),
      icon: Video,
      component: AudioVideoSettings
    },
    { id: 'privacy', name: t('categories.privacy'), icon: Lock, component: PrivacySettings },
    { id: 'advanced', name: t('categories.advanced'), icon: Settings, component: AdvancedSettings }
  ]
}

function SettingsContent() {
  const { t } = useTranslation('settings')
  const search = useSearch({ from: '/settings' })
  const category = search.category || 'general'
  const settingsCategories = useSettingsCategories()

  const currentCategory =
    settingsCategories.find((cat) => cat.id === category) || settingsCategories[0]
  const CurrentComponent = currentCategory.component

  return (
    <div className="overflow-y-auto">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{currentCategory.name}</h1>
          <p className="text-muted-foreground mt-2">{t(`descriptions.${category}`)}</p>
        </div>

        <Suspense fallback={<div>{t('common:loading')}</div>}>
          <CurrentComponent key={category} />
        </Suspense>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const { t } = useTranslation('common')

  return (
    <Suspense fallback={<div>{t('loading')}...</div>}>
      <SettingsContent />
    </Suspense>
  )
}
