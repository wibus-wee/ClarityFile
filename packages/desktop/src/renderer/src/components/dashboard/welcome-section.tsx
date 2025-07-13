import { useAppStore } from '@renderer/stores/app'
import { Avatar } from '@heroui/react'
import { Sparkles, Sun, Moon, Coffee } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatFullDate } from '@renderer/lib/i18n-formatters'
export function WelcomeSection() {
  const user = useAppStore((state) => state.user)
  const { t } = useTranslation('dashboard')

  // 获取当前时间和问候语
  const getGreeting = () => {
    const hour = new Date().getHours()
    const greetings = [
      // 深夜 0-5点
      {
        condition: hour >= 0 && hour < 6,
        messages: t('welcome.greetings.lateNight', { returnObjects: true }) as string[],
        icon: Moon
      },
      // 早晨 6-9点
      {
        condition: hour >= 6 && hour < 9,
        messages: t('welcome.greetings.morning', { returnObjects: true }) as string[],
        icon: Sun
      },
      // 上午 9-12点
      {
        condition: hour >= 9 && hour < 12,
        messages: t('welcome.greetings.forenoon', { returnObjects: true }) as string[],
        icon: Sun
      },
      // 下午 12-18点
      {
        condition: hour >= 12 && hour < 18,
        messages: t('welcome.greetings.afternoon', { returnObjects: true }) as string[],
        icon: Sun
      },
      // 晚上 18-22点
      {
        condition: hour >= 18 && hour < 22,
        messages: t('welcome.greetings.evening', { returnObjects: true }) as string[],
        icon: Moon
      },
      // 深夜 22-24点
      {
        condition: hour >= 22,
        messages: t('welcome.greetings.night', { returnObjects: true }) as string[],
        icon: Moon
      }
    ]

    const currentGreeting = greetings.find((g) => g.condition)
    if (currentGreeting) {
      const randomMessage =
        currentGreeting.messages[Math.floor(Math.random() * currentGreeting.messages.length)]
      return { text: randomMessage, icon: currentGreeting.icon }
    }

    return { text: t('welcome.greetings.default'), icon: Sun }
  }

  const greeting = getGreeting()
  const GreetingIcon = greeting.icon

  // 根据时间段生成不同的欢迎信息
  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    const messages = [
      // 深夜 0-5点
      {
        condition: hour >= 0 && hour < 6,
        messages: t('welcome.messages.lateNight', { returnObjects: true }) as string[]
      },
      // 早晨 6-9点
      {
        condition: hour >= 6 && hour < 9,
        messages: t('welcome.messages.morning', { returnObjects: true }) as string[]
      },
      // 上午 9-12点
      {
        condition: hour >= 9 && hour < 12,
        messages: t('welcome.messages.forenoon', { returnObjects: true }) as string[]
      },
      // 下午 12-18点
      {
        condition: hour >= 12 && hour < 18,
        messages: t('welcome.messages.afternoon', { returnObjects: true }) as string[]
      },
      // 晚上 18-22点
      {
        condition: hour >= 18 && hour < 22,
        messages: t('welcome.messages.evening', { returnObjects: true }) as string[]
      },
      // 深夜 22-24点
      {
        condition: hour >= 22,
        messages: t('welcome.messages.night', { returnObjects: true }) as string[]
      }
    ]

    const currentMessage = messages.find((m) => m.condition)
    if (currentMessage) {
      return currentMessage.messages[Math.floor(Math.random() * currentMessage.messages.length)]
    }

    return t('welcome.messages.default')
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-border/50 p-6">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-xl" />

      <div className="relative flex items-center gap-4">
        {/* 用户头像 */}
        <div className="relative">
          <Avatar
            src={user?.avatar}
            name={user?.name}
            size="lg"
            isBordered
            className="ring-2 ring-primary/20"
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
        </div>

        {/* 问候信息 */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <GreetingIcon className="w-5 h-5 text-primary" />
            <span className="text-lg font-medium text-foreground">
              {greeting.text}，{user?.name || t('welcome.defaultUser')}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">{getWelcomeMessage()}</p>
        </div>

        {/* 装饰图标 */}
        <div className="hidden sm:flex items-center gap-2 text-primary/60">
          <Sparkles className="w-5 h-5" />
          <Coffee className="w-4 h-4" />
        </div>
      </div>

      {/* 今日提示与动态文案 */}
      <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
        {/* 日期信息 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>
            {t('welcome.todayIs')} {formatFullDate(new Date().toISOString())}
          </span>
        </div>
      </div>
    </div>
  )
}
