import { motion, useScroll, useTransform } from 'framer-motion'

import { Badge } from '@clarity/shadcn/ui/badge'
import {
  FolderPlus,
  Sparkles,
  CheckCircle,
  Zap,
  Shield,
  Users,
  Brain,
  Layers,
  Search,
  BarChart3,
  Clock,
  Star,
  Download,
  ExternalLink,
  AlertTriangle,
  Database,
  GitBranch,
  Workflow
} from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { Button } from '@clarity/shadcn/ui/button'

// Hero Section Component
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <motion.section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ y, opacity }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            专为学术团队设计
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
        >
          ClarityFile
          <span className="block text-3xl md:text-4xl font-normal text-muted-foreground mt-2">
            明档 · 智能文档管理中心
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          一款专为学术团队和多项目、多比赛参与者设计的本地化智能文档版本与事务关联中心，
          让文档管理变得简单高效。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button size="lg" className="font-medium">
            <FolderPlus className="w-5 h-5 mr-2" />
            开始使用
          </Button>

          <Button variant="outline" size="lg" className="font-medium">
            <ExternalLink className="w-5 h-5 mr-2" />
            查看源码
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-12 text-sm text-muted-foreground"
        >
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>本地化存储</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>智能管理</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>开源免费</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

// Animated Counter Component
function AnimatedCounter({
  value,
  suffix = '',
  duration = 2
}: {
  value: number
  suffix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / (duration * 1000), 1)
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            setCount(Math.floor(easeOutQuart * value))

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          animate()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value, duration, isVisible])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

// Problem Card Component
interface ProblemData {
  icon: React.ComponentType<{ className?: string }>
  title: string
  category: string
  description: string
  impact: number
  gradient: string
  accentGradient: string
  numberGradient: string
  iconBg: string
  iconColor: string
  badgeColor: string
  statsDot: string
  statsColor: string
}

function ProblemCard({ problem, index }: { problem: ProblemData; index: number }) {
  const Icon = problem.icon
  const cardRef = useRef<HTMLDivElement>(null)

  const directions = [
    { x: -100, rotate: -5 },
    { x: 100, rotate: 5 },
    { y: 100, rotate: -3 },
    { y: -50, rotate: 3 }
  ]

  const direction = directions[index % directions.length]

  return (
    <motion.div
      ref={cardRef}
      initial={{
        opacity: 0,
        ...direction,
        scale: 0.8
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1
      }}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        type: 'spring',
        stiffness: 100,
        damping: 15
      }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, type: 'spring', stiffness: 300 }
      }}
      className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${problem.gradient} backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-2xl hover:shadow-primary/10`}
    >
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <div
          className={`w-full h-full rounded-full bg-gradient-to-bl ${problem.accentGradient} blur-2xl`}
        />
      </div>

      <div className="absolute -bottom-8 -left-8 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <div
          className={`w-full h-full rounded-full bg-gradient-to-tr ${problem.accentGradient} blur-xl`}
        />
      </div>

      <div className="relative p-8">
        {/* Problem Number */}
        <div className="absolute top-6 right-6">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: index * 0.15 + 0.3, type: 'spring' }}
            className={`w-8 h-8 rounded-full bg-gradient-to-r ${problem.numberGradient} flex items-center justify-center text-white text-sm font-bold shadow-lg`}
          >
            {String(index + 1).padStart(2, '0')}
          </motion.div>
        </div>

        {/* Category Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.15 + 0.2 }}
          className="mb-4"
        >
          <Badge variant="secondary" className={`${problem.badgeColor} border-0 font-medium`}>
            {problem.category}
          </Badge>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{
            delay: index * 0.15 + 0.4,
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          whileHover={{
            rotate: [0, -10, 10, 0],
            transition: { duration: 0.5 }
          }}
          className={`inline-flex p-4 rounded-2xl ${problem.iconBg} mb-6 group-hover:shadow-lg transition-shadow duration-300`}
        >
          <Icon className={`w-8 h-8 ${problem.iconColor}`} />
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 + 0.5 }}
          className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300"
        >
          {problem.title}
        </motion.h3>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 + 0.6 }}
          className="text-muted-foreground leading-relaxed mb-6"
        >
          {problem.description}
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 + 0.7 }}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <div className={`w-2 h-2 rounded-full ${problem.statsDot}`} />
          <span className="text-muted-foreground">影响范围:</span>
          <span className={`${problem.statsColor} font-bold`}>
            <AnimatedCounter value={problem.impact} suffix="%" />
          </span>
          <span className="text-muted-foreground">的团队</span>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Problems Section Component - Completely Redesigned
function ProblemsSection() {
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
      impact: 85,
      gradient: 'from-red-50/80 via-white/50 to-red-50/30',
      accentGradient: 'from-red-500 to-pink-500',
      numberGradient: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100/80 border border-red-200/50',
      iconColor: 'text-red-600',
      badgeColor: 'bg-red-100/80 text-red-700',
      statsDot: 'bg-red-500',
      statsColor: 'text-red-600'
    },
    {
      icon: Search,
      title: '信息检索困境',
      category: '文件组织',
      description:
        '文件夹和文件命名混乱，缺乏统一的命名规范和分类体系，导致查找困难，新文件不知如何归档，工作效率严重受影响。',
      impact: 78,
      gradient: 'from-orange-50/80 via-white/50 to-orange-50/30',
      accentGradient: 'from-orange-500 to-yellow-500',
      numberGradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100/80 border border-orange-200/50',
      iconColor: 'text-orange-600',
      badgeColor: 'bg-orange-100/80 text-orange-700',
      statsDot: 'bg-orange-500',
      statsColor: 'text-orange-600'
    },
    {
      icon: Database,
      title: '协作效率瓶颈',
      category: '信息整合',
      description:
        '比赛通知、项目核心成果（专利、红头文件）、成员信息、经费报销等相关信息与核心文档割裂，形成信息孤岛，难以统一管理和关联查阅。',
      impact: 92,
      gradient: 'from-blue-50/80 via-white/50 to-blue-50/30',
      accentGradient: 'from-blue-500 to-cyan-500',
      numberGradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100/80 border border-blue-200/50',
      iconColor: 'text-blue-600',
      badgeColor: 'bg-blue-100/80 text-blue-700',
      statsDot: 'bg-blue-500',
      statsColor: 'text-blue-600'
    },
    {
      icon: Workflow,
      title: '项目管理复杂性',
      category: '多项目协调',
      description:
        '难以有效区分和管理多个核心项目及Side-project的各类资料，项目间资源共享困难，缺乏统一的项目管理视图和协调机制。',
      impact: 73,
      gradient: 'from-purple-50/80 via-white/50 to-purple-50/30',
      accentGradient: 'from-purple-500 to-indigo-500',
      numberGradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100/80 border border-purple-200/50',
      iconColor: 'text-purple-600',
      badgeColor: 'bg-purple-100/80 text-purple-700',
      statsDot: 'bg-purple-500',
      statsColor: 'text-purple-600'
    }
  ]

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden">
      {/* Animated Background */}
      <motion.div
        style={{ y: backgroundY, opacity: backgroundOpacity }}
        className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-accent/20"
      />

      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-secondary/10 to-primary/5 rounded-full blur-3xl" />

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
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive border border-destructive/20 mb-6"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">核心痛点分析</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent"
          >
            学术团队面临的
            <span className="block text-destructive">文档管理挑战</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
          >
            深入调研发现，超过 <span className="font-bold text-destructive">80%</span>{' '}
            的学术团队在文档管理中遇到以下核心问题， 严重影响工作效率和协作质量
          </motion.p>
        </motion.div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
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
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">ClarityFile 专为解决这些问题而生</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Features Section Component
function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: '智能文档管理',
      description: '自动化文件命名和结构化存放，从根本上解决文件混乱问题',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200/50'
    },
    {
      icon: Layers,
      title: '版本控制系统',
      description: '清晰追踪文档版本变化，轻松管理多版本文件',
      color: 'bg-green-500/10 text-green-600 border-green-200/50'
    },
    {
      icon: Users,
      title: '团队协作',
      description: '支持多人协作，统一管理团队项目和成员信息',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200/50'
    },
    {
      icon: Shield,
      title: '本地化存储',
      description: '数据完全存储在本地，保障隐私安全和自主可控',
      color: 'bg-orange-500/10 text-orange-600 border-orange-200/50'
    },
    {
      icon: BarChart3,
      title: '项目统计',
      description: '全面的项目数据统计和分析，助力决策制定',
      color: 'bg-red-500/10 text-red-600 border-red-200/50'
    },
    {
      icon: Zap,
      title: '高效搜索',
      description: '强大的全文搜索功能，快速定位所需文档和信息',
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200/50'
    }
  ]

  return (
    <section className="py-24 px-6 bg-muted/30">
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
                className={`p-6 rounded-xl border ${feature.color} backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/5`}
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

// Benefits Section Component
function BenefitsSection() {
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
    <section className="py-24 px-6 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
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

// CTA Section Component
function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border/50 p-12"
        >
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-xl" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              准备好开始了吗？
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              立即体验 ClarityFile，让文档管理变得简单高效。
              开始您的智能文档管理之旅，提升团队协作效率。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button size="lg" className="px-8 py-6 text-lg font-medium">
                <FolderPlus className="w-5 h-5 mr-2" />
                创建第一个项目
              </Button>

              <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium">
                <Download className="w-5 h-5 mr-2" />
                下载应用
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>完全免费</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>开源项目</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>持续更新</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Main Dashboard Component
function App() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemsSection />
      <FeaturesSection />
      <BenefitsSection />
      <CTASection />
    </div>
  )
}

export default App
