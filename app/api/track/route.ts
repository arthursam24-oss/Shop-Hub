import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
    const trackingNumber = request.nextUrl.searchParams.get("tracking")?.trim();
    if (!trackingNumber) return Response.json({ error: "Enter a tracking number" }, { status: 400 });

    const supabase = getSupabaseServer();
    if (!supabase) return Response.json({ error: "Supabase is not configured" }, { status: 503 });

    const { data: order, error } = await supabase
        .from("orders")
        .select("id, tracking_number, status, created_at, delivery_method")
        .eq("tracking_number", trackingNumber)
        .maybeSingle();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    if (!order) return Response.json({ error: "No order found with that tracking number" }, { status: 404 });
    return Response.json(order);
}
