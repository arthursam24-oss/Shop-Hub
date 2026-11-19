import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
    const { identifier } = await request.json();
    const supabase = getSupabaseServer();
    if (!supabase) return Response.json({ error: "Supabase is not configured" }, { status: 503 });
    const value = String(identifier || "").trim();
    if (!value) return Response.json({ error: "Username or phone is required" }, { status: 400 });

    if (value.includes("@")) return Response.json({ email: value });
    const digits = value.replace(/[^0-9]/g, "");
    const { data: booth } = await supabase.from("vendor_booths").select("owner_id").or(`username.eq.${value},phone.eq.${value}`).maybeSingle();
    if (!booth?.owner_id) {
        if (digits) return Response.json({ phone: digits });
        return Response.json({ error: "Account not found" }, { status: 404 });
    }
    const { data: users } = await supabase.auth.admin.listUsers();
    const account = users?.users.find((user) => user.id === booth.owner_id);
    if (!account) return Response.json({ error: "Account not found" }, { status: 404 });
    return Response.json(account.email ? { email: account.email } : account.phone ? { phone: account.phone } : { error: "Account cannot be resolved" });
}
