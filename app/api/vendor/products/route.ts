import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const supabase = getSupabaseServer();
    if (!supabase) return Response.json({ error: "Supabase is not configured" }, { status: 503 });

    const authorization = request.headers.get("authorization") || "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) return Response.json({ error: "Please sign in as a vendor" }, { status: 401 });

    const { data: booth } = await supabase.from("vendor_booths").select("*").eq("owner_id", authData.user.id).maybeSingle();
    if (!booth) return Response.json({ error: "Vendor booth not found" }, { status: 404 });

    const price = Number(body.price);
    const originalPrice = Number(body.originalPrice || price);
    if (!body.name || !body.categoryId || !Number.isFinite(price) || price <= 0) return Response.json({ error: "Name, category and valid price are required" }, { status: 400 });

    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    const slug = `${String(body.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-6)}`;
    const { data: product, error } = await supabase.from("products").insert({
        name: String(body.name), slug, description: String(body.description || ""), specifications: body.specifications || {},
        price, original_price: originalPrice, discount, stock: Number(body.stock || 0), sold: 0, brand: booth.business_name,
        images: body.images || [], rating: 0, review_count: 0, sizes: body.sizes || [], colors: body.colors || [],
        is_flash_sale: Boolean(body.isFlashSale), category_id: body.categoryId, vendor_id: booth.id, status: "pending",
    }).select("*").single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(product);
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    const supabase = getSupabaseServer();
    if (!supabase) return Response.json({ error: "Supabase is not configured" }, { status: 503 });
    const authorization = request.headers.get("authorization") || "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) return Response.json({ error: "Please sign in" }, { status: 401 });

    const { data: booth } = await supabase.from("vendor_booths").select("id").eq("owner_id", authData.user.id).maybeSingle();
    if (!booth) return Response.json({ error: "Vendor booth not found" }, { status: 404 });

    const updates: any = {};
    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.originalPrice !== undefined) updates.original_price = Number(body.originalPrice);
    if (body.stock !== undefined) updates.stock = Number(body.stock);
    if (body.discount !== undefined) updates.discount = Number(body.discount);
    if (body.isFlashSale !== undefined) updates.is_flash_sale = Boolean(body.isFlashSale);
    if (body.status !== undefined) updates.status = body.status;

    const { data, error } = await supabase.from("products").update(updates).eq("id", body.id).eq("vendor_id", booth.id).select("*").single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
}
