import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/study-plans')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/study-plans"!</div>
}
