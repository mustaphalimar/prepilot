import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/subjects')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/subjects"!</div>
}
