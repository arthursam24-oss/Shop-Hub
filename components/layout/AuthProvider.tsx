"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });

export function useAuth() { return useContext(AuthContext); }

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase) { setLoading(false); return; }
        supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setLoading(false); });
        const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
        return () => data.subscription.unsubscribe();
    }, []);

    return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
