import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/unauthorized')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const { userRole } = useUser()

    const handleGoBack = () => {
        // Navigate based on user role
        switch (userRole) {
            case 'owner':
                navigate({ to: '/admin-interface' }) // or whatever your owner route is
                break
            case 'staff':
                navigate({ to: '/staff' })
                break
            case 'customer':
                navigate({ to: '/customer-interface' })
                break
            case 'chef':
                navigate({ to: '/chef-interface' })
                break
            default:
                navigate({ to: '/' }) // fallback to home
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700 mb-6">
                You don't have permission to view this page.
            </p>
            <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-[#964B00] text-white rounded-lg hover:bg-[#7a3d00] transition-colors"
            >
                Go Back to Dashboard
            </button>
        </div>
    )
}