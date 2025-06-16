import { motion } from 'framer-motion'
import { Clock, Shield, Users, Star } from 'lucide-react'

// Benefits Section Component
export function BenefitsSection() {
  const benefits = [
    {
      icon: Clock,
      title: '提升效率',
      description: '自动化管理减少手动操作，让您专注于核心工作',
      stats: '节省 80% 文件整理时间'
    },
    {
      icon: Shield,
      title: '数据安全',
      description: '本地存储确保数据隐私，完全掌控您的重要文档',
      stats: '100% 本地化存储'
    },
    {
      icon: Users,
      title: '团队协作',
      description: '统一的项目管理平台，提升团队协作效率',
      stats: '支持无限团队成员'
    },
    {
      icon: Star,
      title: '智能体验',
      description: '智能分类和搜索，快速找到您需要的任何文档',
      stats: '毫秒级搜索响应'
    }
  ]

  return (
    <section
      id="about"
      className="py-24 px-6 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">为什么选择 ClarityFile</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            专为学术团队设计的文档管理解决方案，带来前所未有的管理体验
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Icon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                  {benefit.description}
                </p>
                <div className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
                  {benefit.stats}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
