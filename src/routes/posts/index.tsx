import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='p-2'>
      <Link to='/posts/$postId' params={{ postId: '3' }}>
        Post 3
      </Link>
    </div>
  )
}
