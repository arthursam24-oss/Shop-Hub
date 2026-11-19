import Link from "next/link";
import { Truck, WalletCards, RotateCcw, ShieldCheck } from "lucide-react";
import { getSupabaseServer } from "@/lib/supabase-server";
import ProductCard from "@/components/product/ProductCard";
import FlashCountdown from "@/components/product/FlashCountdown";

export const instant = false;

export default async function Home() {
  const supabase = getSupabaseServer();
  const categoryRows = supabase ? await supabase.from("categories").select("*").order("name", { ascending: true }) : { data: [] };
  const flashRows = supabase ? await supabase.from("products").select("*").eq("is_flash_sale", true).order("discount", { ascending: false }).limit(8) : { data: [] };
  const featuredRows = supabase ? await supabase.from("products").select("*").order("sold", { ascending: false }).limit(12) : { data: [] };
  const categories = categoryRows.data || [];
  const flashProducts = flashRows.data || [];
  const featured = featuredRows.data || [];

  const categoryOrder = ["electronics", "fashion", "phones-tablets", "home-office", "health-beauty", "groceries"];
  const orderedCategories = categoryOrder.map((slug) => categories.find((category) => category.slug === slug)).filter(Boolean) as typeof categories;

  return (
    <div className="mx-auto max-w-[1380px] px-3 py-5 lg:px-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_210px]">
        <div className="relative min-h-[260px] overflow-hidden rounded-lg bg-gradient-to-r from-[#111827] via-[#4A1D2B] to-[#7A1F33] sm:min-h-[340px]">
          <div className="absolute inset-0 flex items-center px-8 sm:px-12">
            <div className="max-w-md text-white">
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-orange-300">Weekend deals</p>
              <h1 className="text-3xl font-black leading-tight sm:text-5xl">Big savings.<br />Better shopping.</h1>
              <Link href="/products" className="mt-6 inline-block rounded-md bg-[#7A1F33] px-6 py-3 text-sm font-bold shadow-lg">Shop Now</Link>
            </div>
          </div>
        </div>
        <aside className="hidden space-y-3 lg:block">
          {[{ icon: Truck, title: "Fast Delivery", text: "At your doorstep" }, { icon: WalletCards, title: "Pay on Delivery", text: "Shop with confidence" }, { icon: RotateCcw, title: "Easy Returns", text: "Within 7 days" }, { icon: ShieldCheck, title: "Secure Shopping", text: "Protected payments" }].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 rounded-lg bg-white p-4"><Icon className="text-[#f68b1e]" size={24} /><div><p className="text-sm font-bold">{title}</p><p className="text-xs text-gray-500">{text}</p></div></div>
          ))}
        </aside>
      </section>

      {flashProducts.length > 0 && (
        <section className="mt-5 overflow-hidden rounded-lg bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-black text-[#b43d27]">Flash Sales</h2>
            <FlashCountdown end={flashProducts[0].flashSaleEnd?.toISOString() || new Date(Date.now() + 86400000).toISOString()} />
            <Link href="/products?flash=true" className="text-sm font-bold text-[#f68b1e]">See All</Link>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {flashProducts.slice(0, 6).map((product) => (
              <div key={product.id}><ProductCard product={{ ...product, flashSaleEnd: undefined } as any} />{product.stock < 30 && <p className="mt-1 text-xs text-gray-500">{product.stock} items left</p>}</div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-5 rounded-lg bg-white p-4">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black">Shop by Category</h2></div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {orderedCategories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.slug}`} className="group text-center"><div className="aspect-square overflow-hidden rounded-full bg-gray-100"><img src={category.image} alt={category.name} className="h-full w-full object-cover transition group-hover:scale-105" /></div><p className="mt-2 text-xs font-bold sm:text-sm">{category.name}</p></Link>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-lg bg-white p-4">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black">Top Selling Items</h2><Link href="/products" className="text-sm font-bold text-[#f68b1e]">See All</Link></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      {orderedCategories.map((category) => (
        <CategoryRow key={category.id} category={category} />
      ))}
    </div>
  );
}

async function CategoryRow({ category }: { category: { id: string; name: string; slug: string } }) {
  const supabase = getSupabaseServer();
  const { data: products } = supabase ? await supabase.from("products").select("*").eq("category_id", category.id).order("rating", { ascending: false }).limit(6) : { data: [] };
  if (!products?.length) return null;
  return <section className="mt-5 rounded-lg bg-white p-4"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black">{category.name}</h2><Link href={`/products?category=${category.slug}`} className="text-sm font-bold text-[#f68b1e]">See All</Link></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
}
