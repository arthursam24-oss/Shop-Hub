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
    const [avatarUrl, setAvatarUrl] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => { setMode(params.get("mode") === "signin" ? "signin" : "signup"); }, [params]);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!supabase) { setMessage("Supabase is not configured yet. Add your Supabase environment variables."); return; }
        setLoading(true); setConfirmed(false); setMessage("");
        try {
            if (mode === "signup") {
                const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, avatar_url: avatarUrl, role: "customer" } } });
                if (error) setMessage(error.message);
                else {
                    setConfirmed(true); setMessage("Account created successfully.");
                    if (data.user) await supabase.from("profiles").upsert({ id: data.user.id, full_name: fullName, phone: "", avatar_url: avatarUrl, role: "customer" });
                    setTimeout(() => router.push(params.get("next") || "/products"), 900);
                }
            } else {
                let credential: any = email.includes("@") ? { email } : null;
                if (!credential) {
                    const resolved = await fetch("/api/auth/resolve-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: email }) });
                    const value = await resolved.json();
                    if (!resolved.ok) throw new Error(value.error || "Account not found");
                    credential = value.email ? { email: value.email } : value.phone ? { phone: value.phone } : null;
                }
                if (!credential) throw new Error("Enter your email, username or phone number");
                const { error } = await supabase.auth.signInWithPassword({ ...credential, password });
                if (error) setMessage(error.message);
                else { setConfirmed(true); setMessage("Signed in successfully."); setTimeout(() => router.push(params.get("next") || "/products"), 700); }
            }
        } catch (error: any) {
            setMessage(error?.message || "Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto max-w-md px-3 py-10">
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-black text-[#7A1F33]">{mode === "signup" ? "Create an account" : "Welcome back"}</h1>
                <p className="mt-2 text-sm text-gray-500">Sign in with email, username or phone number.</p>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    {mode === "signup" && <><label className="block text-sm font-bold">Full name<input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2.5 font-normal outline-none focus:border-[#7A1F33]" /></label><label className="block text-sm font-bold">Optional profile picture URL<input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-md border px-3 py-2.5 font-normal outline-none focus:border-[#7A1F33]" /></label></>}
                    <label className="block text-sm font-bold">Email / Username / Phone<input required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2.5 font-normal outline-none focus:border-[#7A1F33]" /></label>
                    <label className="block text-sm font-bold">Password<input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2.5 font-normal outline-none focus:border-[#7A1F33]" /></label>
                    {confirmed && <div className="animate-pulse rounded-lg bg-green-50 p-3 text-center text-sm font-bold text-green-700">✓ Confirmed — continuing...</div>}
                    {message && <p className="rounded bg-rose-50 p-3 text-sm text-[#7A1F33]">{message}</p>}
                    <button disabled={loading} className={`relative w-full overflow-hidden rounded-md py-3 font-bold text-white disabled:opacity-60 ${loading ? "bg-[#5C1727]" : "bg-[#7A1F33]"}`}><span className={loading ? "inline-block animate-pulse" : ""}>{loading ? "Verifying account..." : mode === "signup" ? "Create Account" : "Sign In"}</span></button>
                </form>
                <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="mt-5 w-full text-sm text-[#7A1F33]">{mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}</button>
            </div>
        </main>
    );
}
