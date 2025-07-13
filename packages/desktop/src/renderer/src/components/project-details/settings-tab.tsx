import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button } from '@clarity/shadcn/ui/button'
import { Separator } from '@clarity/shadcn/ui/separator'
import { Badge } from '@clarity/shadcn/ui/badge'
import {
  SettingsForm,
  SettingsSection,
  SettingsInputField,
  SettingsTextareaField,
  SettingsSelectField
} from '@renderer/components/settings/components'
import { Settings, Folder, Tag, Archive, Trash2, AlertTriangle } from 'lucide-react'
import { useUpdateProject, useDeleteProject } from '@renderer/hooks/use-tipc'
import { Shortcut } from '@renderer/components/shortcuts'
import { toast } from 'sonner'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { projectSettingsSchema } from '../../../../main/types/project-schemas'
import type { ProjectDetailsOutput } from '../../../../main/types/project-schemas'

interface SettingsTabProps {
  projectDetails: ProjectDetailsOutput
}

type ProjectSettingsForm = z.infer<typeof projectSettingsSchema>

export function SettingsTab({ projectDetails }: SettingsTabProps) {
  const { project, tags } = projectDetails
  const [showDangerZone, setShowDangerZone] = useState(false)
  const { t } = useTranslation('projects')

  const statusOptions = [
    { value: 'active', label: t('settingsTab.statusOptions.active') },
    { value: 'on_hold', label: t('settingsTab.statusOptions.on_hold') },
    { value: 'archived', label: t('settingsTab.statusOptions.archived') }
  ]

  const { trigger: updateProject } = useUpdateProject()
  const { trigger: deleteProject } = useDeleteProject()

  const defaultValues: ProjectSettingsForm = {
    name: project.name,
    description: project.description || '',
    status: project.status as 'active' | 'archived' | 'on_hold'
  }

  const handleSaveSettings = async (data: ProjectSettingsForm) => {
    try {
      await updateProject({
        id: project.id,
        name: data.name,
        description: data.description,
        status: data.status
      })
      toast.success(t('settingsTab.messages.saveSuccess'))
    } catch (error) {
      console.error('保存项目设置失败:', error)
      toast.error(t('settingsTab.messages.saveFailed'))
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm(t('settingsTab.dangerZone.delete.confirm'))) {
      return
    }

    try {
      await deleteProject({ id: project.id })
      toast.success(t('settingsTab.messages.deleteSuccess'))
      // 这里应该导航回项目列表
    } catch (error) {
      console.error('删除项目失败:', error)
      toast.error(t('settingsTab.messages.deleteFailed'))
    }
  }

  const handleArchiveProject = async () => {
    try {
      await updateProject({
        id: project.id,
        status: 'archived'
      })
      toast.success(t('settingsTab.messages.archiveSuccess'))
    } catch (error) {
      console.error('归档项目失败:', error)
      toast.error(t('settingsTab.messages.archiveFailed'))
    }
  }

  return (
    <div className="space-y-8">
      {/* 基本设置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Shortcut shortcut={['cmd', 's']} description={t('shortcuts.saveSettings')}>
          <SettingsForm
            category="project"
            schema={projectSettingsSchema}
            defaultValues={defaultValues}
            onSubmit={handleSaveSettings}
            submitButtonText={t('settingsTab.actions.saveSettings')}
          >
            {(form) => (
              <>
                <SettingsSection
                  title={t('settingsTab.basicInfo.title')}
                  description={t('settingsTab.basicInfo.description')}
                >
                  <SettingsInputField
                    control={form.control}
                    name="name"
                    label={t('settingsTab.fields.name.label')}
                    description={t('settingsTab.fields.name.description')}
                    placeholder={t('settingsTab.fields.name.placeholder')}
                  />

                  <SettingsTextareaField
                    control={form.control}
                    name="description"
                    label={t('settingsTab.fields.description.label')}
                    description={t('settingsTab.fields.description.description')}
                    placeholder={t('settingsTab.fields.description.placeholder')}
                  />

                  <SettingsSelectField
                    control={form.control}
                    name="status"
                    label={t('settingsTab.fields.status.label')}
                    description={t('settingsTab.fields.status.description')}
                    placeholder={t('settingsTab.fields.status.placeholder')}
                    options={statusOptions}
                  />
                </SettingsSection>
              </>
            )}
          </SettingsForm>
        </Shortcut>
      </motion.div>

      <Separator />

      {/* 项目标签 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="w-5 h-5" />
              {t('settingsTab.tags.title')}
            </h3>
            <p className="text-sm text-muted-foreground">{t('settingsTab.tags.description')}</p>
          </div>
          <Button variant="outline" size="sm">
            <Tag className="w-4 h-4 mr-2" />
            {t('settingsTab.tags.manage')}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <Badge
                key={tag.tagId}
                variant="secondary"
                className="text-sm"
                style={{ backgroundColor: tag.tagColor || undefined }}
              >
                {tag.tagName}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{t('settingsTab.tags.noTags')}</p>
          )}
        </div>
      </motion.div>

      <Separator />

      {/* 项目统计 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          {t('settingsTab.projectInfo.title')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Folder className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{t('settingsTab.projectInfo.projectId')}</span>
            </div>
            <code className="text-xs bg-muted px-2 py-1 rounded">{project.id}</code>
          </div>

          <div className="p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{t('settingsTab.projectInfo.createdAt')}</span>
            </div>
            <p>{new Date(project.createdAt).toLocaleString()}</p>
          </div>

          <div className="p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{t('settingsTab.projectInfo.updatedAt')}</span>
            </div>
            <p>{new Date(project.updatedAt).toLocaleString()}</p>
          </div>

          {project.currentCoverAssetId && (
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{t('settingsTab.projectInfo.coverAsset')}</span>
              </div>
              <p className="text-xs text-muted-foreground">ID: {project.currentCoverAssetId}</p>
            </div>
          )}
        </div>
      </motion.div>

      <Separator />

      {/* 危险操作区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <Button
          variant="outline"
          onClick={() => setShowDangerZone(!showDangerZone)}
          className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/5"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          {showDangerZone ? t('settingsTab.dangerZone.hide') : t('settingsTab.dangerZone.show')}
        </Button>

        {showDangerZone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">
                {t('settingsTab.dangerZone.title')}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-yellow-200 rounded bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                    {t('settingsTab.dangerZone.archive.title')}
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    {t('settingsTab.dangerZone.archive.description')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleArchiveProject}
                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {t('settingsTab.dangerZone.archive.button')}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-red-200 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-300">
                    {t('settingsTab.dangerZone.delete.title')}
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {t('settingsTab.dangerZone.delete.description')}
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteProject}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('settingsTab.dangerZone.delete.button')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
