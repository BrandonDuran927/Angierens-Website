import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/unauthorized')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const { userRoles } = useUser()

    // Role configuration for navigation
    const roleConfig: Record<string, string> = {
        owner: '/admin-interface',
        staff: '/staff',
        chef: '/chef-interface',
        customer: '/customer-interface'
    };

    const handleGoBack = () => {
        // Navigate to the first available role's dashboard
        // Priority: owner > staff > chef > customer
        const rolePriority = ['owner', 'staff', 'chef', 'customer'];

        for (const role of rolePriority) {
            if (userRoles.includes(role)) {
                navigate({ to: roleConfig[role] });
                return;
            }
        }

        // Fallback to home if no valid role
        navigate({ to: '/' });
    }

    // Format roles for display (capitalize first letter)
    const formatRoles = (roles: string[]) => {
        if (roles.length === 0) return 'guest';
        return roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center px-4">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700 mb-6">
                You don't have permission to view this page.
                {userRoles.length > 0 && (
                    <span className="block mt-2 text-sm text-gray-500">
                        Your role{userRoles.length > 1 ? 's' : ''}: {formatRoles(userRoles)}
                    </span>
                )}
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