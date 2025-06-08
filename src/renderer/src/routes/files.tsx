import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { FileManagerPage } from '@renderer/components/file-management/file-manager-page'

const filesSearchSchema = z.object({
  view: z.enum(['grid', 'list', 'details']).default('grid'),
  search: z.string().optional(),
  type: z.string().optional(),
  project: z.string().optional(),
  sortBy: z.enum(['name', 'date', 'size', 'type']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  folder: z.string().optional()
})

export const Route = createFileRoute('/files')({
  component: FileManagerPage,
  validateSearch: filesSearchSchema
})
