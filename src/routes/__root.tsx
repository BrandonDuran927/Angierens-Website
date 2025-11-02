import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Header from '@/components/Header'

export const Route = createRootRoute({
  component: () => (
    <>
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/bg-image.png")' }}
      >
        <div className="min-h-full flex flex-col">
          <Outlet />
        </div>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
})


