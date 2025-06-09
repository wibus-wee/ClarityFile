import { motion } from 'framer-motion'
import { Eye, Monitor } from 'lucide-react'
import { Badge } from '@renderer/components/ui/badge'
import { useIsQuickLookAvailable } from '@renderer/hooks/use-tipc'

interface QuickLookIndicatorProps {
  className?: string
}

export function QuickLookIndicator({ className }: QuickLookIndicatorProps) {
  const { data: quickLookStatus, isLoading } = useIsQuickLookAvailable()

  if (isLoading) {
    return null
  }

  const isAvailable = quickLookStatus?.available

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <Badge
        variant={isAvailable ? 'default' : 'secondary'}
        className={`text-xs flex items-center gap-1 ${
          isAvailable
            ? 'bg-blue-500/10 text-blue-600 border-blue-200/50 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800/50'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {isAvailable ? (
          <>
            <Eye className="w-3 h-3" />
            QuickLook Available
          </>
        ) : (
          <>
            <Monitor className="w-3 h-3" />
            系统预览
          </>
        )}
      </Badge>
    </motion.div>
  )
}
