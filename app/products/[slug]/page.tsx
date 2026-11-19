import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import ProductDetail from "@/components/product/ProductDetail";

export const instant = false;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = getSupabaseServer();
    if (!supabase) notFound();
    const { data: product, error } = await supabase
        .from("products")
        .select("*, category (*), reviews (*), booth:vendor_booths(*)")
        .eq("slug", slug)
        .single();

    if (error || !product) notFound();
    return <ProductDetail product={{ ...product, flashSaleEnd: product.flashSaleEnd || null }} />;
}
