import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/practice-tests')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/practice-tests"!</div>
}
