import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";



type UserContextType = {
    user: User | null;
    userRole: string | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Separate effect to fetch user role when user changes
    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) {
                setUserRole(null);
                setLoading(false);
                return;
            }

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
                } else {
                    console.error("Error fetching user role:", error);
                    setUserRole(null);
                }
            } catch (err) {
                console.error("Exception fetching role:", err);
                setUserRole(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [user]); // Re-run whenever user changes

    // Auth listener - just handles user state, NOT role fetching
    useEffect(() => {
        console.log("Setting up auth listener");

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log("Initial session:", session?.user);
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log("Auth event:", event);
                console.log("New user:", session?.user);
                setUser(session?.user ?? null);
            }
        );

        return () => {
            console.log("Cleaning up auth listener");
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserRole(null);
    };

    return (
        <UserContext.Provider value={{ user, userRole, loading, setUser, signOut }}>
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