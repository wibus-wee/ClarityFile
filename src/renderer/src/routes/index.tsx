import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@renderer/components/dashboard/index'

export const Route = createFileRoute('/')({
  component: Index
})

function Index() {
  return <Dashboard />
}
