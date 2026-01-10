import { useUser } from '@/context/UserContext'
import { Navigate } from '@tanstack/react-router'

type ProtectedRouteProps = {
    children: React.ReactNode;
    allowedRoles?: string[]; // e.g., ['owner', 'staff']
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, userRoles, loading } = useUser();

    console.log("ProtectedRoute check - loading:", loading, "user:", !!user, "userRoles:", userRoles, "allowedRoles:", allowedRoles);

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

    // If we expect roles but userRoles is empty, wait a bit more
    // This handles race conditions where user is set but roles aren't fetched yet
    if (allowedRoles && allowedRoles.length > 0 && userRoles.length === 0) {
        console.log("User exists but roles not loaded yet, showing loading...");
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] animate-fade-in">
                <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-5">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-amber-200"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-amber-600 animate-spin"></div>
                    </div>
                    <div className="text-center">
                        <p className="text-amber-900 font-semibold text-lg">Please wait...</p>
                        <p className="text-amber-600/70 text-sm mt-1">Authenticating your account</p>
                    </div>
                </div>
            </div>
        );
    }

    if (allowedRoles && allowedRoles.length > 0) {
        // Check if user has ANY of the allowed roles
        const hasAllowedRole = userRoles.some(role =>
            allowedRoles.map(r => r.toLowerCase()).includes(role)
        );

        console.log("User roles:", userRoles, "Allowed roles:", allowedRoles, "Has access:", hasAllowedRole);

        if (!hasAllowedRole) {
            console.log("User role not authorized, redirecting to /unauthorized");
            return <Navigate to="/unauthorized" />;
        }
    }

    return <>{children}</>;
}