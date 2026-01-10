import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";



type UserContextType = {
    user: User | null;
    userRole: string | null;
    userRoles: string[]; // Parsed array of roles
    loading: boolean;
    setUser: (user: User | null) => void;
    signOut: () => Promise<void>;
    hasRole: (role: string) => boolean; // Helper to check if user has a specific role
};

// Helper function to parse user roles (handles both array and comma-separated string)
const parseUserRoles = (userRole: string | string[] | null): string[] => {
    if (!userRole) return [];
    if (Array.isArray(userRole)) {
        return userRole.map(r => r.trim().toLowerCase()).filter(r => r);
    }
    if (typeof userRole === 'string') {
        return userRole.split(',').map(r => r.trim().toLowerCase()).filter(r => r);
    }
    return [];
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    // Helper function to check if user has a specific role
    const hasRole = (role: string): boolean => {
        return userRoles.includes(role.toLowerCase());
    };

    // Separate effect to fetch user role when user changes
    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) {
                setUserRole(null);
                setUserRoles([]);
                // Only set loading to false if initial check is done
                if (initialCheckDone) {
                    setLoading(false);
                }
                return;
            }

            // Keep loading true while fetching role
            setLoading(true);
            console.log("Fetching role for user:", user.id);

            try {
                const { data, error } = await supabase
                    .from("users")
                    .select("user_role")
                    .eq("user_uid", user.id)
                    .single();

                console.log("Role query result:", { data, error });

                if (data && !error) {
                    console.log("Fetched user role:", data.user_role);
                    setUserRole(data.user_role);
                    const parsedRoles = parseUserRoles(data.user_role);
                    console.log("Parsed roles:", parsedRoles);
                    setUserRoles(parsedRoles);
                } else {
                    console.error("Error fetching user role:", error);
                    setUserRole(null);
                    setUserRoles([]);
                }
            } catch (err) {
                console.error("Exception fetching role:", err);
                setUserRole(null);
                setUserRoles([]);
            } finally {
                // Always set loading to false after role fetch completes
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [user, initialCheckDone]);

    // Initial session check
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log("Initial session check:", session?.user?.id || "no user");
            setUser(session?.user ?? null);
            setInitialCheckDone(true);
            // If no user, we're done loading
            if (!session?.user) {
                setLoading(false);
            }
            // If there IS a user, the role fetch effect will handle setting loading to false
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log("Auth state changed:", event, session?.user?.id || "no user");
                setUser(session?.user ?? null);
                // If user signs out, set loading to false
                if (!session?.user) {
                    setLoading(false);
                    setUserRole(null);
                    setUserRoles([]);
                }
                // If user signs in, the role fetch effect will handle it
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserRole(null);
        setUserRoles([]);
    };

    return (
        <UserContext.Provider value={{ user, userRole, userRoles, loading, setUser, signOut, hasRole }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}