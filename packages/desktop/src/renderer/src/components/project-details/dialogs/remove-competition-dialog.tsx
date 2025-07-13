import { useState } from 'react'
import { motion } from 'framer-motion'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@clarity/shadcn/ui/dialog'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRemoveProjectFromCompetition } from '@renderer/hooks/use-tipc'

interface RemoveCompetitionDialogProps {
  projectId: string
  competition: {
    milestoneId: string
    seriesName: string
    levelName: string
    statusInMilestone: string | null
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RemoveCompetitionDialog({
  projectId,
  competition,
  open,
  onOpenChange,
  onSuccess
}: RemoveCompetitionDialogProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const { t } = useTranslation('projects')
  const removeProjectFromCompetition = useRemoveProjectFromCompetition()

  if (!competition) return null

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await removeProjectFromCompetition.trigger({
        projectId,
        competitionMilestoneId: competition.milestoneId
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('取消关联失败:', error)
    } finally {
      setIsRemoving(false)
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case '已获奖':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case '已完成':
      case '已提交':
        return 'bg-green-100 text-green-800 border-green-200'
      case '进行中':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case '准备中':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case '未获奖':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case '已放弃':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {t('dialogs.removeCompetition.title')}
          </DialogTitle>
          <DialogDescription>{t('dialogs.removeCompetition.description')}</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* 赛事信息 */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{competition.seriesName}</h4>
              {competition.statusInMilestone && (
                <Badge className={getStatusColor(competition.statusInMilestone)}>
                  {competition.statusInMilestone}
                </Badge>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{t('dialogs.removeCompetition.milestone')}:</span>{' '}
              {competition.levelName}
            </div>
          </div>

          {/* 警告信息 */}
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-800">
                  {t('dialogs.removeCompetition.warningTitle')}
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• {t('dialogs.removeCompetition.warningItems.remove')}</li>
                  <li>• {t('dialogs.removeCompetition.warningItems.deleteRecords')}</li>
                  <li>• {t('dialogs.removeCompetition.warningItems.irreversible')}</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
          >
            {t('dialogs.removeCompetition.cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={handleRemove} disabled={isRemoving}>
            {isRemoving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('dialogs.removeCompetition.removing')}
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                {t('dialogs.removeCompetition.confirm')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
