"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/layout/AuthProvider";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!loading && !user) router.push("/account?mode=signin&next=%2Faccount%2Fprofile");
    }, [loading, user, router]);

    useEffect(() => {
        if (!user || !supabase) return;
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
            setFullName(data?.full_name || user.user_metadata?.full_name || "");
            setPhone(data?.phone || "");
            setAvatarUrl(data?.avatar_url || user.user_metadata?.avatar_url || "");
        });
    }, [user]);

    async function save(event: React.FormEvent) {
        event.preventDefault(); if (!supabase || !user) return;
        const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: fullName, phone, avatar_url: avatarUrl, role: user.user_metadata?.role || "customer", updated_at: new Date().toISOString() });
        setMessage(error ? error.message : "Profile updated successfully.");
    }

    return <main className="mx-auto max-w-xl px-3 py-8"><div className="rounded-lg bg-white p-6"><h1 className="text-2xl font-black text-[#7A1F33]">My Profile</h1><form onSubmit={save} className="mt-5 space-y-4"><div className="flex items-center gap-4">{avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-[#7A1F33]"><UserRound size={32} /></div>}<div className="text-sm text-gray-500"><Camera className="mb-1" size={18} />Add an optional profile picture URL</div></div><label className="block text-sm font-bold">Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded border px-3 py-2.5" /></label><label className="block text-sm font-bold">Phone number<input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded border px-3 py-2.5" /></label><label className="block text-sm font-bold">Profile picture URL<input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded border px-3 py-2.5" /></label>{message && <p className="rounded bg-rose-50 p-3 text-sm text-[#7A1F33]">{message}</p>}<button className="w-full rounded bg-[#7A1F33] py-3 font-bold text-white">Save Profile</button></form></div></main>;
}
