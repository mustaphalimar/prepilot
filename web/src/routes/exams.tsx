import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/exams')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/exams"!</div>
}
