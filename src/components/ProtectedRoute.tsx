import { useUser } from '@/context/UserContext'
import { Navigate } from '@tanstack/react-router'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user } = useUser();

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>
}
