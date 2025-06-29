import { useAppStore } from '@renderer/stores/app'
import { Avatar } from '@heroui/react'
import { Sparkles, Sun, Moon, Coffee } from 'lucide-react'
export function WelcomeSection() {
  const user = useAppStore((state) => state.user)

  // 获取当前时间和问候语
  const getGreeting = () => {
    const hour = new Date().getHours()
    const greetings = [
      // 深夜 0-5点
      {
        condition: hour >= 0 && hour < 6,
        messages: ['夜深了', '还在熬夜呢', '注意休息哦'],
        icon: Moon
      },
      // 早晨 6-9点
      {
        condition: hour >= 6 && hour < 9,
        messages: ['早上好', '新的一天开始了', '早起的鸟儿有虫吃'],
        icon: Sun
      },
      // 上午 9-12点
      {
        condition: hour >= 9 && hour < 12,
        messages: ['上午好', '工作状态不错', '保持专注'],
        icon: Sun
      },
      // 下午 12-18点
      {
        condition: hour >= 12 && hour < 18,
        messages: ['下午好', '午后时光', '继续加油'],
        icon: Sun
      },
      // 晚上 18-22点
      {
        condition: hour >= 18 && hour < 22,
        messages: ['晚上好', '辛苦一天了', '该放松一下了'],
        icon: Moon
      },
      // 深夜 22-24点
      {
        condition: hour >= 22,
        messages: ['夜深了', '该休息了', '明天继续努力'],
        icon: Moon
      }
    ]

    const currentGreeting = greetings.find((g) => g.condition)
    if (currentGreeting) {
      const randomMessage =
        currentGreeting.messages[Math.floor(Math.random() * currentGreeting.messages.length)]
      return { text: randomMessage, icon: currentGreeting.icon }
    }

    return { text: '你好', icon: Sun }
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
        messages: ['夜猫子模式开启，记得保护眼睛', '深夜工作要注意休息哦', '熬夜伤身，适度为好']
      },
      // 早晨 6-9点
      {
        condition: hour >= 6 && hour < 9,
        messages: ['新的一天，新的开始！', '早晨的阳光为你加油', '美好的一天从这里开始']
      },
      // 上午 9-12点
      {
        condition: hour >= 9 && hour < 12,
        messages: ['上午时光，效率最佳', '专注工作，收获满满', '保持这个节奏，很棒！']
      },
      // 下午 12-18点
      {
        condition: hour >= 12 && hour < 18,
        messages: ['午后时光，继续前进', '下午茶时间到了吗？', '保持专注，你很棒！']
      },
      // 晚上 18-22点
      {
        condition: hour >= 18 && hour < 22,
        messages: ['晚上好，今天辛苦了', '夜晚时光，放松一下', '回顾今天的收获吧']
      },
      // 深夜 22-24点
      {
        condition: hour >= 22,
        messages: ['夜深了，该准备休息了', '明天又是新的开始', '早点休息，保持健康']
      }
    ]

    const currentMessage = messages.find((m) => m.condition)
    if (currentMessage) {
      return currentMessage.messages[Math.floor(Math.random() * currentMessage.messages.length)]
    }

    return '欢迎回到 ClarityFile'
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
              {greeting.text}，{user?.name || '用户'}
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
            今天是{' '}
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
