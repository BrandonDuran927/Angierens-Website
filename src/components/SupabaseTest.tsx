// Create a new file: src/components/SupabaseTest.tsx
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';
import { useEffect } from 'react';

export function SupabaseTest() {
    const [result, setResult] = useState<any>(null);

    const testQuery = async () => {
        console.log("=== STARTING SUPABASE TEST ===");

        try {
            // Test 1: Simple select all
            console.log("Test 1: Selecting all users...");
            const { data: allUsers, error: allError } = await supabase
                .from("users")
                .select("*");

            console.log("Test 1 Result - data:", allUsers, "error:", allError);

            // Test 2: Select with filter
            console.log("Test 2: Selecting specific user...");
            const { data: specificUser, error: specificError } = await supabase
                .from("users")
                .select("user_role")
                .eq("user_uid", "2398045d-7fbe-4fba-be85-41871ef1d34a")
                .single();

            console.log("Test 2 Result - data:", specificUser, "error:", specificError);

            // Test 3: Check auth session
            console.log("Test 3: Checking auth session...");
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            console.log("Test 3 Result - user:", session?.user?.id, "error:", sessionError);

            setResult({ allUsers, specificUser, session: session?.user?.id });
        } catch (err) {
            console.error("Test error:", err);
            setResult({ error: err });
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid red' }}>
            <h2>Supabase Connection Test</h2>
            <button onClick={testQuery} style={{ padding: '10px', fontSize: '16px' }}>
                Run Test
            </button>
            <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
    );
}