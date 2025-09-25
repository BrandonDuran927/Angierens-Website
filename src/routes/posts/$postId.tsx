import { createFileRoute, useLoaderData } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const id = params.postId;
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${id}`
    );

    if (!response.ok) throw Error();

    const data = await response.json();
    return {
      postId: params.postId,
      data
    };
  }
})

function RouteComponent() {
  const { postId, data } = Route.useLoaderData();
  // const { data } = useLoaderData({ from: "/posts/$postId" })

  return (
    <div className='p-2'>
      Hello {postId}
      <br />
      {data.title}
      {data.body}
    </div>
  )
}
