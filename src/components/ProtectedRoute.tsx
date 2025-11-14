import { useUser } from '@/context/UserContext'
import { Navigate } from '@tanstack/react-router'

type ProtectedRouteProps = {
    children: React.ReactNode;
    allowedRoles?: string[]; // e.g., ['owner', 'staff']
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, userRole, loading } = useUser();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    // Not logged in - redirect to login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Check if role is required and user has permission
    if (allowedRoles && allowedRoles.length > 0) {
        console.log("User role:", userRole, "Allowed roles:", allowedRoles);
        if (!userRole || !allowedRoles.includes(userRole)) {
            console.log("User role not authorized, redirecting to /unauthorized");
            // User doesn't have required role - redirect to unauthorized
            return <Navigate to="/unauthorized" />;
        }
    }

    // User is authenticated and has correct role
    return <>{children}</>;
}