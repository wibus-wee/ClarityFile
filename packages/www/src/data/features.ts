import { Brain, Layers, Users, Shield, BarChart3, Zap } from 'lucide-react'

// Feature Data Interface
export interface FeatureData {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  details: string[]
  techSpecs: string[]
  gradient: string
  accentGradient: string
  iconBg: string
  iconColor: string
  badgeColor: string
  category: string
}

// Features Data
export const featuresData: FeatureData[] = [
  {
    id: 'smart-management',
    icon: Brain,
    title: '智能文档管理',
    description: '基于 AI 的自动化文件命名和结构化存放系统',
    category: '智能化',
    details: [
      '智能文件命名：基于内容自动生成规范化文件名',
      '自动分类归档：根据文件类型和项目关联自动存放',
      '重复文件检测：智能识别并合并重复或相似文件',
      '文档关联分析：自动建立文档间的关联关系'
    ],
    techSpecs: ['支持多种文件格式', '毫秒级文件分析响应', '99.5% 分类准确率', '自定义规则引擎'],
    gradient:
      'from-blue-50/80 via-white/50 to-blue-50/30 dark:from-blue-950/40 dark:via-slate-900/30 dark:to-blue-950/20',
    accentGradient: 'from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400',
    iconBg: 'bg-blue-100/80 border border-blue-200/50 dark:bg-blue-900/30 dark:border-blue-800/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badgeColor: 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  },
  {
    id: 'version-control',
    icon: Layers,
    title: '版本控制系统',
    description: '企业级版本管理，完整追踪文档生命周期',
    category: '版本管理',
    details: [
      '版本历史记录：完整保存每次修改的详细信息',
      '分支管理：支持并行版本开发和合并',
      '变更对比：可视化显示版本间的具体差异',
      '回滚机制：一键恢复到任意历史版本'
    ],
    techSpecs: ['无限版本历史', '增量存储节省空间', '实时冲突检测', 'Git-like 工作流'],
    gradient:
      'from-green-50/80 via-white/50 to-green-50/30 dark:from-green-950/40 dark:via-slate-900/30 dark:to-green-950/20',
    accentGradient: 'from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400',
    iconBg:
      'bg-green-100/80 border border-green-200/50 dark:bg-green-900/30 dark:border-green-800/30',
    iconColor: 'text-green-600 dark:text-green-400',
    badgeColor: 'bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  },
  {
    id: 'team-collaboration',
    icon: Users,
    title: '团队协作中心',
    description: '统一的多项目团队协作和成员管理平台',
    category: '协作管理',
    details: [
      '成员权限管理：细粒度的文档访问和编辑权限控制',
      '协作工作流：支持文档审批、评论和协同编辑',
      '任务分配：基于项目的任务分配和进度跟踪',
      '通知系统：实时推送项目动态和重要更新'
    ],
    techSpecs: ['支持 100+ 团队成员', '实时协作同步', '角色权限矩阵', '活动日志审计'],
    gradient:
      'from-purple-50/80 via-white/50 to-purple-50/30 dark:from-purple-950/40 dark:via-slate-900/30 dark:to-purple-950/20',
    accentGradient: 'from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400',
    iconBg:
      'bg-purple-100/80 border border-purple-200/50 dark:bg-purple-900/30 dark:border-purple-800/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    badgeColor: 'bg-purple-100/80 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  },
  {
    id: 'local-storage',
    icon: Shield,
    title: '本地化存储',
    description: '完全本地化的数据存储，确保数据主权和隐私安全',
    category: '数据安全',
    details: [
      '本地数据库：SQLite 本地存储，无需云端依赖',
      '加密保护：AES-256 加密保护敏感文档',
      '备份恢复：自动本地备份和一键恢复功能',
      '离线工作：完全离线环境下正常使用'
    ],
    techSpecs: ['AES-256 加密标准', '零网络依赖', '自动增量备份', '跨平台兼容'],
    gradient:
      'from-orange-50/80 via-white/50 to-orange-50/30 dark:from-orange-950/40 dark:via-slate-900/30 dark:to-orange-950/20',
    accentGradient: 'from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400',
    iconBg:
      'bg-orange-100/80 border border-orange-200/50 dark:bg-orange-900/30 dark:border-orange-800/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    badgeColor: 'bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: '项目统计分析',
    description: '深度数据分析和可视化报表，支持决策制定',
    category: '数据分析',
    details: [
      '项目进度分析：实时跟踪项目完成度和里程碑',
      '资源使用统计：分析文档使用频率和存储分布',
      '团队效率报告：成员贡献度和协作效率分析',
      '趋势预测：基于历史数据预测项目发展趋势'
    ],
    techSpecs: ['20+ 种图表类型', '自定义报表模板', '数据导出 Excel/PDF', '实时仪表板'],
    gradient:
      'from-red-50/80 via-white/50 to-red-50/30 dark:from-red-950/40 dark:via-slate-900/30 dark:to-red-950/20',
    accentGradient: 'from-red-500 to-pink-500 dark:from-red-400 dark:to-pink-400',
    iconBg: 'bg-red-100/80 border border-red-200/50 dark:bg-red-900/30 dark:border-red-800/30',
    iconColor: 'text-red-600 dark:text-red-400',
    badgeColor: 'bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  },
  {
    id: 'search-engine',
    icon: Zap,
    title: '全文搜索引擎',
    description: '基于 Elasticsearch 的企业级搜索，支持复杂查询',
    category: '搜索技术',
    details: [
      '全文内容搜索：支持 PDF、Word、PPT 等文档内容搜索',
      '智能语义搜索：理解搜索意图，提供相关性排序',
      '高级过滤器：按时间、类型、项目、成员等多维度筛选',
      '搜索历史：保存常用搜索，支持搜索模板'
    ],
    techSpecs: ['毫秒级搜索响应', '支持模糊匹配', '中英文分词', 'Boolean 查询语法'],
    gradient:
      'from-yellow-50/80 via-white/50 to-yellow-50/30 dark:from-yellow-950/40 dark:via-slate-900/30 dark:to-yellow-950/20',
    accentGradient: 'from-yellow-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400',
    iconBg:
      'bg-yellow-100/80 border border-yellow-200/50 dark:bg-yellow-900/30 dark:border-yellow-800/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    badgeColor: 'bg-yellow-100/80 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  }
]
