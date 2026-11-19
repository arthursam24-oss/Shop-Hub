import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import ProductCard from "@/components/product/ProductCard";

export const instant = false;

export default async function BoothPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = getSupabaseServer();
    if (!supabase) notFound();
    const { data: booth } = await supabase.from("vendor_booths").select("*").eq("slug", slug).eq("status", "approved").maybeSingle();
    if (!booth) notFound();
    const { data: products } = await supabase.from("products").select("*, booth:vendor_booths(*)").eq("vendor_id", booth.id).eq("status", "approved").order("created_at", { ascending: false });
    return <main className="mx-auto max-w-[1380px] px-3 py-6 lg:px-6"><section className="rounded-lg bg-white p-5"><div className="flex items-center gap-4">{booth.logo_url ? <img src={booth.logo_url} alt={booth.business_name} className="h-20 w-20 rounded-full object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-2xl font-black text-[#7A1F33]">{booth.business_name.charAt(0)}</div>}<div><p className="text-xs font-bold uppercase text-[#7A1F33]">Official Vendor Booth</p><h1 className="text-2xl font-black">{booth.business_name}</h1>{booth.description && <p className="mt-1 text-sm text-gray-500">{booth.description}</p>}</div></div></section><section className="mt-5 rounded-lg bg-white p-5"><h2 className="mb-4 text-lg font-black">All Products</h2>{!products?.length ? <p className="py-10 text-center text-gray-500">This booth has no approved products yet.</p> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>}</section></main>;
}
