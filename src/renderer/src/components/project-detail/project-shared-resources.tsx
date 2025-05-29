import { Button } from '@renderer/components/ui/button'
import { Share2, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProjectSharedResourcesProps {
  projectId: string
}

export function ProjectSharedResources({ projectId }: ProjectSharedResourcesProps) {
  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">关联资源</h2>
          <p className="text-sm text-muted-foreground">管理项目关联的共享资源和模板</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          关联共享资源
        </Button>
      </div>

      {/* 空状态 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <Share2 className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">暂无关联资源</h3>
        <p className="text-sm text-muted-foreground mb-4">
          将项目关联到相关的共享资源和模板
        </p>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          关联共享资源
        </Button>
      </motion.div>
    </div>
  )
}
