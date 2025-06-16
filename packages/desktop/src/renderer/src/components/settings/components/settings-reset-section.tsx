'use client'

import { toast } from 'sonner'
import { Button } from '@renderer/components/ui/button'
import { Separator } from '@renderer/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@renderer/components/ui/alert-dialog'
import { useResetSettings } from '@renderer/hooks/use-tipc'

interface SettingsResetSectionProps {
  title?: string
  description?: string
  buttonText?: string
  confirmTitle?: string
  confirmDescription?: string
  successMessage?: string
  className?: string
  showSeparator?: boolean
}

export function SettingsResetSection({
  title = '重置设置',
  description = '将所有设置恢复为默认值',
  buttonText = '重置所有设置',
  confirmTitle = '确认重置设置',
  confirmDescription = '此操作将删除所有自定义设置并恢复为默认值。此操作无法撤销。',
  successMessage = '所有设置已重置为默认值',
  className = 'space-y-6',
  showSeparator = true
}: SettingsResetSectionProps) {
  const { trigger: resetSettings } = useResetSettings()

  const handleResetAllSettings = async () => {
    try {
      await resetSettings({})
      toast.success(successMessage)
    } catch (error) {
      console.error('重置设置失败:', error)
      toast.error('重置设置失败')
    }
  }

  return (
    <>
      {showSeparator && <Separator />}
      
      <div className={className}>
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-destructive">危险操作</h4>
                <p className="text-sm text-muted-foreground">
                  此操作将删除所有自定义设置并恢复为默认值，且无法撤销。
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    {buttonText}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {confirmDescription}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetAllSettings}>
                      确认重置
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
