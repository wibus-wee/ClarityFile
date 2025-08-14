'use client'

import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@clarity/shadcn/ui/avatar'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Separator } from '@clarity/shadcn/ui/separator'
import { CalendarDays, Mail, User as UserIcon } from 'lucide-react'

import { SettingsForm, SettingsSection, SettingsInputField } from './components'
import { useAppStore } from '@renderer/stores/app'

// 创建动态 schema 函数，支持翻译
function createUserSettingsSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t('user.nameValidation')).max(100, t('user.nameMaxLength')),
    email: z.email(t('user.emailValidation')).max(255, t('user.emailMaxLength')),
    avatar: z.url(t('user.avatarValidation')).optional().or(z.literal(''))
  })
}

type UserSettingsForm = z.infer<ReturnType<typeof createUserSettingsSchema>>

export function UserSettings() {
  const { t } = useTranslation(['settings', 'common'])
  const { user, updateUser, isLoading } = useAppStore()
  const [isUpdating, setIsUpdating] = useState(false)

  const userSettingsSchema = createUserSettingsSchema(t)

  // 默认值从当前用户信息获取
  const defaultValues: UserSettingsForm = {
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  }

  // 自定义提交处理
  const handleSubmit = async (data: UserSettingsForm) => {
    if (!user) return

    setIsUpdating(true)
    try {
      await updateUser({
        name: data.name,
        email: data.email,
        avatar: data.avatar || undefined
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // 获取角色显示名称
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      founder: t('user.roles.founder'),
      enterprise: t('user.roles.enterprise'),
      pro: t('user.roles.pro'),
      basic: t('user.roles.basic')
    }
    return roleMap[role] || role
  }

  // 获取角色样式
  const getRoleVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      founder: 'default',
      enterprise: 'default',
      pro: 'secondary',
      basic: 'outline'
    }
    return variantMap[role] || 'outline'
  }

  if (isLoading || !user) {
    return <div>{t('states.loading', { ns: 'common' })}...</div>
  }

  return (
    <div className="space-y-8">
      {/* 用户信息展示 */}
      <div className="border border-border bg-card rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{t('user.accountInfo')}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{t('user.accountInfoDescription')}</p>
        {/* 用户头像和基本信息 */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <Badge variant={getRoleVariant(user.role)}>{getRoleDisplayName(user.role)}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>
          </div>
        </div>

        <Separator />

        {/* 账户详情 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t('user.createdAt')}:</span>
            <span>{formatDate(user.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t('user.updatedAt')}:</span>
            <span>{formatDate(user.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* 编辑用户信息表单 */}
      <SettingsForm
        category="user"
        schema={userSettingsSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitButtonText={isUpdating ? t('user.updating') : t('user.updateProfile')}
      >
        {(form) => (
          <>
            <SettingsSection
              title={t('user.personalInfo')}
              description={t('user.personalInfoDescription')}
            >
              <SettingsInputField
                control={form.control}
                name="name"
                label={t('user.name')}
                description={t('user.nameDescription')}
                placeholder={t('user.namePlaceholder')}
              />

              <SettingsInputField
                control={form.control}
                name="email"
                label={t('user.email')}
                description={t('user.emailDescription')}
                placeholder={t('user.emailPlaceholder')}
                type="email"
              />

              <SettingsInputField
                control={form.control}
                name="avatar"
                label={t('user.avatar')}
                description={t('user.avatarDescription')}
                placeholder={t('user.avatarPlaceholder')}
                type="url"
              />
            </SettingsSection>
          </>
        )}
      </SettingsForm>
    </div>
  )
}
