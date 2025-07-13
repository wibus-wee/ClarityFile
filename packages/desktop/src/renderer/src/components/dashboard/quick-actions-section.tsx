import { Button } from '@clarity/shadcn/ui/button'
import { FolderPlus, FileText, Upload, Settings, Trophy, CreditCard } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export function QuickActionsSection() {
  const { t } = useTranslation('dashboard')

  const quickActions = [
    {
      title: t('quickActions.actions.createProject.title'),
      description: t('quickActions.actions.createProject.description'),
      icon: FolderPlus,
      href: '/projects'
    },
    {
      title: t('quickActions.actions.addDocument.title'),
      description: t('quickActions.actions.addDocument.description'),
      icon: FileText,
      href: '/documents'
    },
    {
      title: t('quickActions.actions.fileManagement.title'),
      description: t('quickActions.actions.fileManagement.description'),
      icon: Upload,
      href: '/files'
    },
    {
      title: t('quickActions.actions.competitions.title'),
      description: t('quickActions.actions.competitions.description'),
      icon: Trophy,
      href: '/competitions'
    },
    {
      title: t('quickActions.actions.expenses.title'),
      description: t('quickActions.actions.expenses.description'),
      icon: CreditCard,
      href: '/expenses'
    },
    {
      title: t('quickActions.actions.settings.title'),
      description: t('quickActions.actions.settings.description'),
      icon: Settings,
      href: '/settings'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('quickActions.title')}</h2>
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
                variant="outline"
                asChild
                className="h-auto p-4 justify-start bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Link to={action.href} className="w-full">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-md bg-muted">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm text-foreground">{action.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {action.description}
                      </div>
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
