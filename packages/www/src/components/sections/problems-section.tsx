import { useScroll, useTransform, motion } from 'framer-motion'
import { GitBranch, Search, Database, Workflow, AlertTriangle, Sparkles } from 'lucide-react'
import { useRef } from 'react'
import { ProblemCard } from '../ProblemCard'

// Problems Section Component - Completely Redesigned
export function ProblemsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3])

  const problems = [
    {
      icon: GitBranch,
      title: '版本控制危机',
      category: '文档管理',
      description:
        '针对不同比赛、不同赛级、通用需求产生的多版本PPT、商业计划书、项目说明书等文件，版本追踪混乱，难以管理和查找最新版本。',
      details: [
        '平均每个项目产生 15-30 个文档版本',
        '团队成员花费 40% 时间寻找正确版本',
        '版本冲突导致 60% 的重复工作',
        '缺失版本历史记录造成决策困难'
      ],
      scenarios: [
        '创新创业大赛：BP v1.0 → v2.3 → final → 真final',
        '学科竞赛：技术方案多轮迭代无法追溯',
        '项目申报：不同级别申报书版本混乱'
      ],
      impact: 85,
      timeWasted: '每周 12 小时',
      gradient:
        'from-red-50/80 via-white/50 to-red-50/30 dark:from-red-950/40 dark:via-slate-900/30 dark:to-red-950/20',
      accentGradient: 'from-red-500 to-pink-500 dark:from-red-400 dark:to-pink-400',
      numberGradient: 'from-red-500 to-red-600 dark:from-red-400 dark:to-red-500',
      iconBg: 'bg-red-100/80 border border-red-200/50 dark:bg-red-900/30 dark:border-red-800/30',
      iconColor: 'text-red-600 dark:text-red-400',
      badgeColor: 'bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      statsDot: 'bg-red-500 dark:bg-red-400',
      statsColor: 'text-red-600 dark:text-red-400'
    },
    {
      icon: Search,
      title: '信息检索困境',
      category: '文件组织',
      description:
        '文件夹和文件命名混乱，缺乏统一的命名规范和分类体系，导致查找困难，新文件不知如何归档，工作效率严重受影响。',
      details: [
        '文件命名不规范导致搜索失效',
        '深层嵌套文件夹结构复杂难导航',
        '缺乏标签和元数据管理系统',
        '跨项目文件关联关系丢失'
      ],
      scenarios: [
        '找不到上次修改的财务报表在哪个文件夹',
        '相似文件名导致误用过期版本',
        '新成员无法快速理解文件组织逻辑'
      ],
      impact: 78,
      timeWasted: '每周 8 小时',
      gradient:
        'from-orange-50/80 via-white/50 to-orange-50/30 dark:from-orange-950/40 dark:via-slate-900/30 dark:to-orange-950/20',
      accentGradient: 'from-orange-500 to-yellow-500 dark:from-orange-400 dark:to-yellow-400',
      numberGradient: 'from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500',
      iconBg:
        'bg-orange-100/80 border border-orange-200/50 dark:bg-orange-900/30 dark:border-orange-800/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      badgeColor: 'bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      statsDot: 'bg-orange-500 dark:bg-orange-400',
      statsColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      icon: Database,
      title: '协作效率瓶颈',
      category: '信息整合',
      description:
        '比赛通知、项目核心成果（专利、红头文件）、成员信息、经费报销等相关信息与核心文档割裂，形成信息孤岛，难以统一管理和关联查阅。',
      details: [
        '项目相关信息分散在多个平台和工具',
        '成员信息、经费状态与项目文档脱节',
        '比赛时间线与文档版本无法关联',
        '缺乏统一的项目全景视图'
      ],
      scenarios: [
        '报销时找不到对应的项目预算文档',
        '比赛截止日期临近才发现文档版本过期',
        '新成员加入无法快速了解项目全貌'
      ],
      impact: 92,
      timeWasted: '每周 15 小时',
      gradient:
        'from-blue-50/80 via-white/50 to-blue-50/30 dark:from-blue-950/40 dark:via-slate-900/30 dark:to-blue-950/20',
      accentGradient: 'from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400',
      numberGradient: 'from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500',
      iconBg:
        'bg-blue-100/80 border border-blue-200/50 dark:bg-blue-900/30 dark:border-blue-800/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badgeColor: 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      statsDot: 'bg-blue-500 dark:bg-blue-400',
      statsColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Workflow,
      title: '项目管理复杂性',
      category: '多项目协调',
      description:
        '难以有效区分和管理多个核心项目及Side-project的各类资料，项目间资源共享困难，缺乏统一的项目管理视图和协调机制。',
      details: [
        '多项目并行导致资源分配混乱',
        '项目优先级和进度难以统一跟踪',
        '共享资源（模板、素材）重复存储',
        '项目间依赖关系不明确'
      ],
      scenarios: [
        '同时参与 3+ 个比赛项目资料混乱',
        '核心项目与 Side-project 资源冲突',
        '团队成员跨项目协作效率低下'
      ],
      impact: 73,
      timeWasted: '每周 10 小时',
      gradient:
        'from-purple-50/80 via-white/50 to-purple-50/30 dark:from-purple-950/40 dark:via-slate-900/30 dark:to-purple-950/20',
      accentGradient: 'from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400',
      numberGradient: 'from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500',
      iconBg:
        'bg-purple-100/80 border border-purple-200/50 dark:bg-purple-900/30 dark:border-purple-800/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      badgeColor: 'bg-purple-100/80 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      statsDot: 'bg-purple-500 dark:bg-purple-400',
      statsColor: 'text-purple-600 dark:text-purple-400'
    }
  ]

  return (
    <section id="solutions" ref={ref} className="relative py-32 px-6 overflow-hidden">
      {/* Animated Background */}
      <motion.div
        style={{ y: backgroundY, opacity: backgroundOpacity }}
        className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-accent/20 dark:from-muted/20 dark:via-transparent dark:to-accent/10"
      />

      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/3 dark:to-accent/3 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-secondary/10 to-primary/5 dark:from-secondary/6 dark:to-primary/3 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive border border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30 mb-6"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">ClarityFile 为何诞生？</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent"
          >
            学术团队面临的
            <span className="block text-destructive">文档管理挑战</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-5xl mx-auto"
          >
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-6">
              深入调研发现，超过 <span className="font-bold text-destructive">80%</span>{' '}
              的学术团队在文档管理中遇到以下核心问题，严重影响工作效率和协作质量
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 dark:bg-destructive/10 dark:border-destructive/20">
                <div className="text-2xl font-bold text-destructive dark:text-destructive">45h</div>
                <div className="text-xs text-muted-foreground">月均时间浪费</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10 dark:bg-orange-500/10 dark:border-orange-500/20">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">73%</div>
                <div className="text-xs text-muted-foreground">重复工作比例</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 dark:bg-blue-500/10 dark:border-blue-500/20">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">156</div>
                <div className="text-xs text-muted-foreground">平均文件数量</div>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 dark:bg-purple-500/10 dark:border-purple-500/20">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">2.3</div>
                <div className="text-xs text-muted-foreground">平均项目数量</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Problems Grid - More Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <ProblemCard key={problem.title} problem={problem} index={index} />
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">ClarityFile 专为解决这些问题而生</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
