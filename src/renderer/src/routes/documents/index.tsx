import { createFileRoute } from '@tanstack/react-router'
import { Documents } from '@renderer/components/documents'

export const Route = createFileRoute('/documents/')({
  component: Documents
})
