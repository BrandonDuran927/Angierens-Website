import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

// Create a custom type that extends the Supabase User with your users table fields
type ExtendedUser = User & {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    phone_number?: string;
    is_active?: boolean;
    user_role?: string;
    date_hired?: string;
    birth_date?: string;
    gender?: string;
    other_contact?: string;
};

type UserContextType = {
    user: ExtendedUser | null;
    setUser: (user: ExtendedUser | null) => void;
    signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<ExtendedUser | null>(null);

    // Function to fetch and merge user data
    const fetchCompleteUserData = async (authUser: User) => {
        const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_uid', authUser.id)
            .single();

        if (error) {
            console.error('Error fetching user data:', error);
            return authUser;
        }

        // Merge auth user with database user data
        return { ...authUser, ...userData } as ExtendedUser;
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const completeUser = await fetchCompleteUserData(session.user);
                setUser(completeUser);
            } else {
                setUser(null);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const completeUser = await fetchCompleteUserData(session.user);
                setUser(completeUser);
            } else {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, signOut }}>
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