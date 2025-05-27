import { createFileRoute } from '@tanstack/react-router'
import { DocumentDetail } from '@renderer/components/documents'

export const Route = createFileRoute('/documents/$documentId')({
  component: DocumentDetail
})
