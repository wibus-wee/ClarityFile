import { createFileRoute } from '@tanstack/react-router'
import { TipcDemo } from '@renderer/components/tipc-demo'

export const Route = createFileRoute('/')({
  component: Index
})

function Index() {
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ClarityFile</h1>
        <p className="text-muted-foreground">TIPC + SWR 集成演示</p>
      </div>
      <TipcDemo />
    </div>
  )
}
