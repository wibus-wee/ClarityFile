import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { WelcomeSection } from './welcome-section'
import { QuickActionsSection } from './quick-actions-section'
import { RecentProjectsSection } from './recent-projects-section'
import { SystemOverviewSection } from './system-overview-section'
import { QuickSearchSection } from './quick-search-section'
import { DynamicQuoteSection } from './dynamic-quote-section'
import { UpcomingCompetitionsSection } from './upcoming-competitions-section'

export function Dashboard() {
  const { t } = useTranslation('dashboard')

  return (
    <div className="container mx-auto">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>

      {/* {t('comments.mainContent')} */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* {t('comments.leftContent')} */}
        <div className="lg:col-span-8 space-y-6">
          {/* {t('comments.welcomeArea')} */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <WelcomeSection />
          </motion.div>

          {/* {t('comments.quickActionsArea')} */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <QuickActionsSection />
          </motion.div>

          {/* {t('comments.recentProjectsArea')} */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <RecentProjectsSection />
          </motion.div>

          {/* {t('comments.recentDocumentsArea')} */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <RecentDocumentsSection />
          </motion.div> */}
        </div>

        {/* {t('comments.rightSidebar')} */}
        <div className="lg:col-span-4 space-y-4">
          {/* {t('comments.quickSearchArea')} */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <QuickSearchSection />
          </motion.div>

          {/* {t('comments.upcomingCompetitionsArea')} */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <UpcomingCompetitionsSection />
          </motion.div>

          {/* {t('comments.systemOverviewArea')} */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <SystemOverviewSection />
          </motion.div>
          {/* {t('comments.dynamicQuoteArea')} */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            <DynamicQuoteSection />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
