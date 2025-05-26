'use client'

import { useSearch } from '@tanstack/react-router'
import { Suspense } from 'react'
import { Bell, Globe, Home, Keyboard, Lock, Paintbrush, Settings, Video } from 'lucide-react'

import { GeneralSettings } from './settings/general-settings'
import { AppearanceSettings } from './settings/appearance-settings'
import { NotificationSettings } from './settings/notification-settings'
import { AdvancedSettings } from './settings/advanced-settings'
import { LanguageSettings } from './settings/language-settings'
import { AccessibilitySettings } from './settings/accessibility-settings'
import { PrivacySettings } from './settings/privacy-settings'
import { AudioVideoSettings } from './settings/audio-video-settings'

const settingsCategories = [
  { id: 'general', name: '常规设置', icon: Home, component: GeneralSettings },
  { id: 'appearance', name: '外观设置', icon: Paintbrush, component: AppearanceSettings },
  { id: 'notifications', name: '通知设置', icon: Bell, component: NotificationSettings },
  { id: 'language', name: '语言与地区', icon: Globe, component: LanguageSettings },
  { id: 'accessibility', name: '无障碍', icon: Keyboard, component: AccessibilitySettings },
  { id: 'audio-video', name: '音频与视频', icon: Video, component: AudioVideoSettings },
  { id: 'privacy', name: '隐私与可见性', icon: Lock, component: PrivacySettings },
  { id: 'advanced', name: '高级设置', icon: Settings, component: AdvancedSettings }
]

function SettingsContent() {
  const search = useSearch({ from: '/settings' })
  const category = search.category || 'general'

  const currentCategory =
    settingsCategories.find((cat) => cat.id === category) || settingsCategories[0]
  const CurrentComponent = currentCategory.component

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{currentCategory.name}</h1>
          <p className="text-muted-foreground mt-2">
            管理应用程序的{currentCategory.name.toLowerCase()}
          </p>
        </div>

        <Suspense fallback={<div>加载中...</div>}>
          <CurrentComponent key={category} />
        </Suspense>
      </div>
    </div>
  )
}

export function SettingsPage() {
  return (
    <Suspense fallback={<div>加载设置页面...</div>}>
      <SettingsContent />
    </Suspense>
  )
}
