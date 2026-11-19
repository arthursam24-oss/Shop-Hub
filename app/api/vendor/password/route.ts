import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function PATCH(request: NextRequest) {
    const supabase = getSupabaseServer();
    if (!supabase) return Response.json({ error: "Supabase is not configured" }, { status: 503 });
    const authorization = request.headers.get("authorization") || "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return Response.json({ error: "Please sign in" }, { status: 401 });

    const { password } = await request.json();
    if (!password || String(password).length < 6) return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    const { error: updateError } = await supabase.auth.admin.updateUserById(data.user.id, { password: String(password) });
    if (updateError) return Response.json({ error: updateError.message }, { status: 400 });
    return Response.json({ success: true });
}
