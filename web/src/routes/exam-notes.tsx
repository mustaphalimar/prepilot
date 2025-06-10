import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/exam-notes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/exam-notes"!</div>
}
