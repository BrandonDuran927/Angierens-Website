import { useUser } from '@/context/UserContext'
import { Navigate } from '@tanstack/react-router'

type ProtectedRouteProps = {
    children: React.ReactNode;
    allowedRoles?: string[]; // e.g., ['owner', 'staff']
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, userRole, loading } = useUser();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && allowedRoles.length > 0 && userRole) {
        console.log("User role:", userRole, "Allowed roles:", allowedRoles);  // TODO: This is the culprit, it returns null on userRole
        if (!userRole || !allowedRoles.includes(userRole)) {
            console.log("User role not authorized, redirecting to /unauthorized");
            return <Navigate to="/unauthorized" />;
        }
    }

    return <>{children}</>;
}