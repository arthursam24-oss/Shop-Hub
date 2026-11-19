import ProductCard from "@/components/product/ProductCard";
import { getSupabaseServer } from "@/lib/supabase-server";
import Link from "next/link";

export const instant = false;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const params = await searchParams;
    const category = typeof params.category === "string" ? params.category : undefined;
    const q = typeof params.q === "string" ? params.q : undefined;
    const sort = typeof params.sort === "string" ? params.sort : "popular";

    const supabase = getSupabaseServer();
    const categoryRows = supabase ? await supabase.from("categories").select("*").order("name", { ascending: true }) : { data: [] };
    const categories = categoryRows.data || [];
    const categoryRecord = category ? categories.find((item) => item.slug === category) : undefined;
    let productQuery = supabase ? supabase.from("products").select("*") : null;
    if (productQuery && categoryRecord) productQuery = productQuery.eq("category_id", categoryRecord.id);
    if (productQuery && q) productQuery = productQuery.or(`name.ilike.%${q}%,brand.ilike.%${q}%,description.ilike.%${q}%`);
    if (productQuery) productQuery = sort === "low" ? productQuery.order("price", { ascending: true }) : sort === "high" ? productQuery.order("price", { ascending: false }) : sort === "new" ? productQuery.order("created_at", { ascending: false }) : productQuery.order("sold", { ascending: false });
    const productRows = productQuery ? await productQuery : { data: [] };
    const products = productRows.data || [];

    return (
        <div className="mx-auto max-w-[1380px] px-3 py-5 lg:px-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-gray-500">Home / Products</p><h1 className="text-2xl font-black">{q ? `Results for “${q}”` : categoryRecord?.name || "All Products"}</h1></div><form className="flex items-center gap-2 text-sm"><label>Sort:</label><select name="sort" defaultValue={sort} className="rounded border bg-white px-3 py-2"><option value="popular">Popularity</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="new">Newest Arrivals</option></select></form></div>
            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <aside className="h-fit rounded-lg bg-white p-4">
                    <h2 className="mb-3 font-bold">Category</h2>
                    <div className="space-y-2">{categories.map((item) => <Link key={item.id} href={`/products?category=${item.slug}`} className={`block rounded px-2 py-1.5 text-sm ${item.slug === category ? "bg-orange-100 font-bold text-[#f68b1e]" : "text-gray-700 hover:bg-gray-50"}`}>{item.name}</Link>)}</div>
                    <h2 className="mb-3 mt-6 font-bold">Price Range</h2><div className="flex gap-2"><input aria-label="Minimum price" type="number" placeholder="Min" className="w-1/2 rounded border px-2 py-2 text-sm" /><input aria-label="Maximum price" type="number" placeholder="Max" className="w-1/2 rounded border px-2 py-2 text-sm" /></div>
                    <h2 className="mb-3 mt-6 font-bold">Minimum Rating</h2><select className="w-full rounded border px-2 py-2 text-sm"><option>Any rating</option><option>4 stars & up</option><option>4.5 stars & up</option></select>
                </aside>
                {products.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg bg-white"><h2 className="text-xl font-bold">No products found</h2><p className="mt-2 text-gray-500">Try another search or category.</p><Link href="/products" className="mt-5 rounded-md bg-[#f68b1e] px-5 py-2.5 font-bold text-white">Continue Shopping</Link></div>}
            </div>
        </div>
    );
}
