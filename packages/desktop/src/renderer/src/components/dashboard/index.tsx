import { motion } from 'framer-motion'
import { WelcomeSection } from './welcome-section'
import { QuickActionsSection } from './quick-actions-section'
import { RecentProjectsSection } from './recent-projects-section'
import { RecentDocumentsSection } from './recent-documents-section'
import { SystemOverviewSection } from './system-overview-section'
import { QuickSearchSection } from './quick-search-section'
import { DynamicQuoteSection } from './dynamic-quote-section'

export function Dashboard() {
  return (
    <div className="container mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
        <p className="text-muted-foreground mt-2">今日事今日毕，重要信息不错过</p>
      </motion.div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧主要内容 */}
        <div className="lg:col-span-8 space-y-6">
          {/* 欢迎区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <WelcomeSection />
          </motion.div>

          {/* 快速操作 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <QuickActionsSection />
          </motion.div>

          {/* 最近项目 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <RecentProjectsSection />
          </motion.div>

          {/* 最近文档 */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <RecentDocumentsSection />
          </motion.div> */}
        </div>

        {/* 右侧边栏 */}
        <div className="lg:col-span-4 space-y-4">
          {/* 快速搜索 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <QuickSearchSection />
          </motion.div>

          {/* 系统概览 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SystemOverviewSection />
          </motion.div>
          {/* 动态文案 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <DynamicQuoteSection />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
