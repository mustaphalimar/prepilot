import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test-results')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/test-results"!</div>
}
