"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AccountPage() {
    return <Suspense fallback={<main className="mx-auto max-w-md px-3 py-10">Loading account...</main>}><AccountForm /></Suspense>;
}

function AccountForm() {
    const params = useSearchParams();
    const router = useRouter();
    const [mode, setMode] = useState(params.get("mode") === "signin" ? "signin" : "signup");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => { setMode(params.get("mode") === "signin" ? "signin" : "signup"); }, [params]);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!supabase) { setMessage("Supabase is not configured yet. Add your Supabase environment variables."); return; }
        setLoading(true); setMessage("");
        if (mode === "signup") {
            const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
            if (error) setMessage(error.message);
            else { setMessage("Account created. Check your email if confirmation is enabled."); router.push(params.get("next") || "/products"); }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setMessage(error.message);
            else router.push(params.get("next") || "/products");
        }
        setLoading(false);
    }

    return <main className="mx-auto max-w-md px-3 py-10"><div className="rounded-xl bg-white p-6 shadow-sm"><h1 className="text-2xl font-black text-[#7A1F33]">{mode === "signup" ? "Create an account" : "Welcome back"}</h1><p className="mt-2 text-sm text-gray-500">Sign in before adding items to your cart.</p><form onSubmit={submit} className="mt-6 space-y-4">{mode === "signup" && <label className="block text-sm font-bold">Full name<input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2.5 font-normal outline-none focus:border-[#7A1F33]" /></label>}<label className="block text-sm font-bold">Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2.5 font-normal outline-none focus:border-[#7A1F33]" /></label><label className="block text-sm font-bold">Password<input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2.5 font-normal outline-none focus:border-[#7A1F33]" /></label>{message && <p className="rounded bg-rose-50 p-3 text-sm text-[#7A1F33]">{message}</p>}<button disabled={loading} className="w-full rounded-md bg-[#7A1F33] py-3 font-bold text-white disabled:opacity-60">{loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}</button></form><button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="mt-5 w-full text-sm text-[#7A1F33]">{mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}</button></div></main>;
}
