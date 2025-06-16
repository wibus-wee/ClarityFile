import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { FeatureCard } from '../FeatureCard'
import { featuresData } from '../../data/features'

// Features Section Component - Redesigned with macOS Style
export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '5%'])
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 0.3])

  return (
    <motion.section
      ref={ref}
      id="features"
      className="relative py-24 px-6 overflow-hidden"
      style={{ y: backgroundY }}
    >
      {/* Background Effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3"
        style={{ opacity: backgroundOpacity }}
      />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            强大的功能特性
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            ClarityFile 提供全面的文档管理解决方案，让您的工作更加高效有序
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {featuresData.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  )
}
