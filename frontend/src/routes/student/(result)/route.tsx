import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/student/(result)')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div><Outlet /></div>
}
