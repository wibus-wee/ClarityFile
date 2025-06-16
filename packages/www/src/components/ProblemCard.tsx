import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { useRef } from 'react'
import { AnimatedCounter } from './AnimatedCounter'
import { Badge } from '@clarity/shadcn'

// Problem Card Component
interface ProblemData {
  icon: React.ComponentType<{ className?: string }>
  title: string
  category: string
  description: string
  details: string[]
  scenarios: string[]
  impact: number
  timeWasted: string
  gradient: string
  accentGradient: string
  numberGradient: string
  iconBg: string
  iconColor: string
  badgeColor: string
  statsDot: string
  statsColor: string
}

export function ProblemCard({ problem, index }: { problem: ProblemData; index: number }) {
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
        transition: { duration: 0.3, type: 'spring', stiffness: 300 }
      }}
      className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${problem.gradient} backdrop-blur-sm hover:border-border`}
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

      <div className="relative p-6">
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
          className={`inline-flex p-3 rounded-xl ${problem.iconBg} mb-4 group-hover:shadow-lg transition-shadow duration-300`}
        >
          <Icon className={`w-6 h-6 ${problem.iconColor}`} />
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 + 0.5 }}
          className="text-lg font-bold mb-2 group-hover:text-primary transition-colors duration-300"
        >
          {problem.title}
        </motion.h3>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 + 0.6 }}
          className="text-sm text-muted-foreground leading-relaxed mb-3"
        >
          {problem.description}
        </motion.p>

        {/* Compact Info Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 + 0.7 }}
          className="mb-3 space-y-2"
        >
          {/* Key Issues - More Compact */}
          <div>
            <h4 className="text-xs font-semibold text-foreground/70 mb-1.5">核心问题</h4>
            <div className="grid grid-cols-2 gap-1">
              {problem.details.slice(0, 4).map((detail, idx) => (
                <div key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <div
                    className={`w-1 h-1 rounded-full ${problem.statsDot} mt-1.5 flex-shrink-0`}
                  />
                  <span className="leading-tight">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scenarios - Single Line Each */}
          <div>
            <h4 className="text-xs font-semibold text-foreground/70 mb-1.5">典型场景</h4>
            <div className="space-y-0.5">
              {problem.scenarios.slice(0, 2).map((scenario, idx) => (
                <div key={idx} className="text-xs text-muted-foreground/80 italic truncate">
                  &quot;{scenario}&quot;
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Compact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 + 0.8 }}
          className="flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${problem.statsDot}`} />
            <span className="text-muted-foreground">影响</span>
            <span className={`${problem.statsColor} font-bold text-sm`}>
              <AnimatedCounter value={problem.impact} suffix="%" />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className={`${problem.statsColor} font-bold`}>{problem.timeWasted}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
