import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/student/(auth)/posts/$postId')({
  component: RouteComponent,
  
})

function RouteComponent() {
  const { postId } = Route.useParams()
  return <div>Hello "/(auth)/posts/$postId"! {postId}</div>
}
