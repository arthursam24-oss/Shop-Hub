import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const supabase = getSupabaseServer();
    if (!supabase) return Response.json({ error: "Supabase is not configured" }, { status: 503 });

    const authorization = request.headers.get("authorization") || "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user || authData.user.user_metadata?.role !== "admin") return Response.json({ error: "Admin access required" }, { status: 403 });

    const username = String(body.username || "").trim();
    const password = String(body.password || "").trim();
    const businessName = String(body.businessName || "").trim();
    const phone = String(body.phone || "").trim();
    if (!username || !password || !businessName) return Response.json({ error: "Business name, username/phone and password are required" }, { status: 400 });

    const email = username.includes("@") ? username : `${username.replace(/[^0-9]/g, "") || `vendor${Date.now()}`}@vendor.shophub.local`;
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email,
        phone: phone || undefined,
        password,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { role: "vendor", username, business_name: businessName },
    });
    if (createError || !created.user) return Response.json({ error: createError?.message || "Could not create vendor account" }, { status: 400 });

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + `-${created.user.id.slice(0, 6)}`;
    const { data: booth, error: boothError } = await supabase.from("vendor_booths").insert({
        owner_id: created.user.id,
        business_name: businessName,
        slug,
        phone,
        username,
        payment_url: body.paymentUrl || null,
        description: body.description || "",
        status: "approved",
    }).select("*").single();

    if (boothError) return Response.json({ error: boothError.message }, { status: 500 });
    await supabase.from("profiles").upsert({ id: created.user.id, full_name: businessName, phone, role: "vendor" });

    return Response.json({ username, password, phone, booth });
}
