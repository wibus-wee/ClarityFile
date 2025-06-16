import { motion } from 'framer-motion'
import { Brain, Layers, Users, Shield, BarChart3, Zap } from 'lucide-react'

// Features Section Component
export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: '智能文档管理',
      description: '基于 AI 的自动化文件命名和结构化存放系统',
      details: [
        '智能文件命名：基于内容自动生成规范化文件名',
        '自动分类归档：根据文件类型和项目关联自动存放',
        '重复文件检测：智能识别并合并重复或相似文件',
        '文档关联分析：自动建立文档间的关联关系'
      ],
      techSpecs: [
        '支持 50+ 种文件格式',
        '毫秒级文件分析响应',
        '99.5% 分类准确率',
        '自定义规则引擎'
      ],
      color: 'bg-blue-500/10 text-blue-600 border-blue-200/50'
    },
    {
      icon: Layers,
      title: '版本控制系统',
      description: '企业级版本管理，完整追踪文档生命周期',
      details: [
        '版本历史记录：完整保存每次修改的详细信息',
        '分支管理：支持并行版本开发和合并',
        '变更对比：可视化显示版本间的具体差异',
        '回滚机制：一键恢复到任意历史版本'
      ],
      techSpecs: ['无限版本历史', '增量存储节省空间', '实时冲突检测', 'Git-like 工作流'],
      color: 'bg-green-500/10 text-green-600 border-green-200/50'
    },
    {
      icon: Users,
      title: '团队协作中心',
      description: '统一的多项目团队协作和成员管理平台',
      details: [
        '成员权限管理：细粒度的文档访问和编辑权限控制',
        '协作工作流：支持文档审批、评论和协同编辑',
        '任务分配：基于项目的任务分配和进度跟踪',
        '通知系统：实时推送项目动态和重要更新'
      ],
      techSpecs: ['支持 100+ 团队成员', '实时协作同步', '角色权限矩阵', '活动日志审计'],
      color: 'bg-purple-500/10 text-purple-600 border-purple-200/50'
    },
    {
      icon: Shield,
      title: '本地化存储',
      description: '完全本地化的数据存储，确保数据主权和隐私安全',
      details: [
        '本地数据库：SQLite 本地存储，无需云端依赖',
        '加密保护：AES-256 加密保护敏感文档',
        '备份恢复：自动本地备份和一键恢复功能',
        '离线工作：完全离线环境下正常使用'
      ],
      techSpecs: ['AES-256 加密标准', '零网络依赖', '自动增量备份', '跨平台兼容'],
      color: 'bg-orange-500/10 text-orange-600 border-orange-200/50'
    },
    {
      icon: BarChart3,
      title: '项目统计分析',
      description: '深度数据分析和可视化报表，支持决策制定',
      details: [
        '项目进度分析：实时跟踪项目完成度和里程碑',
        '资源使用统计：分析文档使用频率和存储分布',
        '团队效率报告：成员贡献度和协作效率分析',
        '趋势预测：基于历史数据预测项目发展趋势'
      ],
      techSpecs: ['20+ 种图表类型', '自定义报表模板', '数据导出 Excel/PDF', '实时仪表板'],
      color: 'bg-red-500/10 text-red-600 border-red-200/50'
    },
    {
      icon: Zap,
      title: '全文搜索引擎',
      description: '基于 Elasticsearch 的企业级搜索，支持复杂查询',
      details: [
        '全文内容搜索：支持 PDF、Word、PPT 等文档内容搜索',
        '智能语义搜索：理解搜索意图，提供相关性排序',
        '高级过滤器：按时间、类型、项目、成员等多维度筛选',
        '搜索历史：保存常用搜索，支持搜索模板'
      ],
      techSpecs: ['毫秒级搜索响应', '支持模糊匹配', '中英文分词', 'Boolean 查询语法'],
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200/50'
    }
  ]

  return (
    <section id="features" className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">强大的功能特性</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ClarityFile 提供全面的文档管理解决方案，让您的工作更加高效有序
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className={`p-6 rounded-xl border ${feature.color} backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5`}
              >
                <div className="mb-4">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
