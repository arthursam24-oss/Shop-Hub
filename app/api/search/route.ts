import { getSupabaseServer } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get("q")?.trim() || "";
    if (!q) return Response.json([]);

    const supabase = getSupabaseServer();
    if (!supabase) return Response.json([]);
    const { data: products } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
        .limit(6);

    return Response.json(products || []);
}
