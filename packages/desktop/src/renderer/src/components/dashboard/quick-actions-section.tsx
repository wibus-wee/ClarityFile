import { Button } from '@clarity/shadcn/ui/button'
import { FolderPlus, FileText, Upload, Settings, Trophy, CreditCard } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'

const quickActions = [
  {
    title: '创建项目',
    description: '开始一个新的项目',
    icon: FolderPlus,
    href: '/projects',
    color:
      'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50',
    hoverColor: 'hover:bg-blue-500/20 dark:hover:bg-blue-500/30'
  },
  {
    title: '添加文档',
    description: '导入或创建文档',
    icon: FileText,
    href: '/documents',
    color:
      'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-200/50 dark:border-green-800/50',
    hoverColor: 'hover:bg-green-500/20 dark:hover:bg-green-500/30'
  },
  {
    title: '文件管理',
    description: '管理项目文件',
    icon: Upload,
    href: '/files',
    color:
      'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50',
    hoverColor: 'hover:bg-purple-500/20 dark:hover:bg-purple-500/30'
  },
  {
    title: '赛事中心',
    description: '管理比赛信息',
    icon: Trophy,
    href: '/competitions',
    color:
      'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/50',
    hoverColor: 'hover:bg-orange-500/20 dark:hover:bg-orange-500/30'
  },
  {
    title: '经费报销',
    description: '提交报销申请',
    icon: CreditCard,
    href: '/expenses',
    color:
      'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-200/50 dark:border-red-800/50',
    hoverColor: 'hover:bg-red-500/20 dark:hover:bg-red-500/30'
  },
  {
    title: '系统设置',
    description: '配置应用设置',
    icon: Settings,
    href: '/settings',
    color: 'bg-muted/50 text-muted-foreground border-border',
    hoverColor: 'hover:bg-muted/80'
  }
]

export function QuickActionsSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">快速操作</h2>
        {/* <Button variant="ghost" size="sm" asChild>
          <Link to="/settings">
            查看全部
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button> */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="ghost"
                asChild
                className={`
                  h-auto p-4 flex flex-col items-start gap-3 border
                  ${action.color} ${action.hoverColor}
                  transition-all duration-200
                `}
              >
                <Link to={action.href} className="w-full">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-background/50">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                    </div>
                  </div>
                </Link>
              </Button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
