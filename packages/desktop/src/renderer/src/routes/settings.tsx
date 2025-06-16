import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SettingsPage } from '@renderer/components/settings-page'

const settingsSearchSchema = z.object({
  category: z.string().optional().default('general')
})

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
  validateSearch: settingsSearchSchema
})
