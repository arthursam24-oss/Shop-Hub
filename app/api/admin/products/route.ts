import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function PATCH(request: NextRequest) {
    const { id, status } = await request.json();
    if (!id || !["approved", "rejected", "pending"].includes(status)) return Response.json({ error: "Invalid product status" }, { status: 400 });
    const supabase = getSupabaseServer();
    if (!supabase) return Response.json({ error: "Supabase is not configured" }, { status: 503 });

    const authorization = request.headers.get("authorization") || "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user || authData.user.user_metadata?.role !== "admin") return Response.json({ error: "Admin access required" }, { status: 403 });

    const { data, error } = await supabase.from("products").update({ status }).eq("id", id).select("*").single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
}
