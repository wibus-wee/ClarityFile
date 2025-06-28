import { motion } from 'framer-motion'
import { FileText, Image, DollarSign, Trophy, TrendingUp, Tag } from 'lucide-react'
import { cn, formatFileSize } from '@renderer/lib/utils'
import type { ProjectDetailsOutput } from '../../../../main/types/project-schemas'

interface ProjectStatisticsProps {
  projectDetails: ProjectDetailsOutput
  className?: string
}

export function ProjectStatistics({ projectDetails, className }: ProjectStatisticsProps) {
  const { documents, assets, expenses, budgetOverview, competitions, tags } = projectDetails

  // 计算统计信息
  const statistics = {
    documentCount: documents.length,
    versionCount: documents.reduce((total, doc) => total + (doc.versions?.length || 0), 0),
    assetCount: assets.length,
    expenseCount: expenses.length,
    // 使用经费池概览中的正确数据
    totalBudget: budgetOverview?.totalBudget || 0,
    usedBudget: budgetOverview?.usedBudget || 0,
    remainingBudget: budgetOverview?.remainingBudget || 0,
    budgetUtilizationRate: budgetOverview?.utilizationRate || 0,
    budgetPoolCount: budgetOverview?.budgetPools?.length || 0,
    competitionCount: competitions.length,

    tagCount: tags.length
  }

  // 计算一些额外的统计信息
  const recentDocuments = documents.filter(
    (doc) => new Date(doc.updatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length

  const recentAssets = assets.filter(
    (asset) => new Date(asset.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length

  const pendingExpenses = expenses.filter((expense) => expense.status === 'pending').length

  const activeCompetitions = competitions.filter(
    (comp) => comp.statusInMilestone === 'active' || comp.statusInMilestone === 'in_progress'
  ).length

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // 计算总文件大小
  const totalAssetSize = assets.reduce((sum, asset) => sum + (asset.fileSizeBytes || 0), 0)

  return (
    <div className={cn('', className)}>
      {/* 扁平化统计信息 - 单行显示 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 文档统计 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">{statistics.documentCount}</span>
              {recentDocuments > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">+{recentDocuments}</span>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              文档 ({statistics.versionCount} 版本)
            </div>
          </div>
        </motion.div>

        {/* 资产统计 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Image className="w-4 h-4 text-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">{statistics.assetCount}</span>
              {recentAssets > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">+{recentAssets}</span>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              资产 ({formatFileSize(totalAssetSize)})
            </div>
          </div>
        </motion.div>

        {/* 经费统计 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-foreground truncate">
              {formatCurrency(statistics.usedBudget)}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              已使用经费 ({statistics.expenseCount} 条
              {pendingExpenses > 0 ? `, ${pendingExpenses} 待审` : ''})
            </div>
          </div>
        </motion.div>

        {/* 赛事统计 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Trophy className="w-4 h-4 text-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-bold text-foreground">{statistics.competitionCount}</div>
            <div className="text-xs text-muted-foreground truncate">
              赛事{activeCompetitions > 0 ? ` (${activeCompetitions} 进行中)` : ''}
            </div>
          </div>
        </motion.div>

        {/* 标签 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Tag className="w-4 h-4 text-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-bold text-foreground">{statistics.tagCount}</div>
            <div className="text-xs text-muted-foreground truncate">标签</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
