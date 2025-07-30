import { motion, type Transition } from 'framer-motion'
import { Badge } from '@clarity/shadcn'
import { ChevronRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { FeatureData } from '../data/features'

// Feature Card Component - macOS Style Design
interface FeatureCardProps {
  feature: FeatureData
  index: number
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const Icon = feature.icon

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      } as Transition
    }
  }

  const hoverVariants = {
    hover: {
      y: -8,
      transition: {
        duration: 0.3,
        type: 'spring',
        stiffness: 300,
        damping: 20
      } as Transition
    }
  }

  const expandVariants = {
    collapsed: { height: 'auto' },
    expanded: { height: 'auto' }
  }

  return (
    <motion.div
      variants={{ ...cardVariants, ...hoverVariants }}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, margin: '-50px' }}
      className="group relative overflow-hidden"
    >
      {/* Main Card */}
      <div
        className={`relative p-6 rounded-2xl border border-border/50 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm hover:border-border/80 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5`}
      >
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <div
            className={`w-full h-full rounded-full bg-gradient-to-bl ${feature.accentGradient} blur-2xl`}
          />
        </div>

        <div className="absolute -bottom-8 -left-8 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <div
            className={`w-full h-full rounded-full bg-gradient-to-tr ${feature.accentGradient} blur-xl`}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1 + 0.3,
                  type: 'spring',
                  stiffness: 200,
                  damping: 15
                }}
                whileHover={{
                  rotate: [0, -10, 10, 0],
                  transition: { duration: 0.5 }
                }}
                className={`p-3 rounded-xl ${feature.iconBg} group-hover:shadow-md transition-shadow duration-300`}
              >
                <Icon className={`w-6 h-6 ${feature.iconColor}`} />
              </motion.div>

              {/* Category Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <Badge
                  variant="secondary"
                  className={`${feature.badgeColor} border-0 font-medium text-xs`}
                >
                  {feature.category}
                </Badge>
              </motion.div>
            </div>

            {/* Expand Button */}
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-background/50 transition-colors duration-200"
            >
              <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </motion.button>
          </div>

          {/* Title & Description */}
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + 0.4 }}
            className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300"
          >
            {feature.title}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className="text-muted-foreground leading-relaxed mb-4"
          >
            {feature.description}
          </motion.p>

          {/* Tech Specs Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + 0.6 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {feature.techSpecs.slice(0, 2).map((spec, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-md"
              >
                <Sparkles className="w-3 h-3" />
                <span>{spec}</span>
              </div>
            ))}
            {feature.techSpecs.length > 2 && (
              <div className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-md">
                +{feature.techSpecs.length - 2} more
              </div>
            )}
          </motion.div>

          {/* Expandable Details */}
          <motion.div
            variants={expandVariants}
            animate={isExpanded ? 'expanded' : 'collapsed'}
            initial="collapsed"
            className="overflow-hidden"
          >
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="pt-4 border-t border-border/30"
              >
                {/* Detailed Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-foreground/80 mb-2">核心功能</h4>
                  <div className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="leading-relaxed">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Tech Specs */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground/80 mb-2">技术规格</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.techSpecs.map((spec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-md"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
