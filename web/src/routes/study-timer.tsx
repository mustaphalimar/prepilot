import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/study-timer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/study-timer"!</div>
}
