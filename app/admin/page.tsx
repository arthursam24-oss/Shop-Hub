import { getSupabaseServer } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/format";

export const instant = false;

export default async function AdminPage() {
    const supabase = getSupabaseServer();
    if (!supabase) return <div className="mx-auto max-w-[1380px] p-8">Supabase is not configured.</div>;
    const [{ data: products }, { data: orders }, { count: categories }] = await Promise.all([
        supabase.from("products").select("*, category:categories(*)").order("created_at", { ascending: false }),
        supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
    ]);
    const productRows = products || [] as any[];
    const orderRows = orders || [] as any[];
    const revenue = orderRows.reduce((sum: number, o: any) => sum + Number(o.total), 0);
    return <div className="mx-auto max-w-[1380px] px-3 py-5 lg:px-6"><h1 className="mb-5 text-2xl font-black">Admin Dashboard</h1><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><div className="rounded-lg bg-white p-5"><p className="text-sm text-gray-500">Products</p><p className="mt-1 text-3xl font-black">{productRows.length}</p></div><div className="rounded-lg bg-white p-5"><p className="text-sm text-gray-500">Orders</p><p className="mt-1 text-3xl font-black">{orderRows.length}</p></div><div className="rounded-lg bg-white p-5"><p className="text-sm text-gray-500">Categories</p><p className="mt-1 text-3xl font-black">{categories}</p></div><div className="rounded-lg bg-white p-5"><p className="text-sm text-gray-500">Revenue</p><p className="mt-1 text-2xl font-black">{formatCurrency(revenue)}</p></div></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><section className="overflow-hidden rounded-lg bg-white"><h2 className="border-b p-4 font-black">Recent Products</h2><div className="max-h-[500px] overflow-auto">{productRows.map(p => <div key={p.id} className="flex items-center gap-3 border-b p-3"><img src={JSON.parse(p.images)[0]} alt="" className="h-12 w-12 rounded object-cover" /><div className="flex-1"><p className="line-clamp-1 text-sm font-bold">{p.name}</p><p className="text-xs text-gray-500">{p.category?.name} · {p.stock} in stock</p></div><b className="text-sm">{formatCurrency(p.price)}</b></div>)}</div></section><section className="overflow-hidden rounded-lg bg-white"><h2 className="border-b p-4 font-black">Recent Orders</h2><div className="max-h-[500px] overflow-auto">{!orderRows.length ? <p className="p-5 text-center text-gray-500">No orders placed yet.</p> : orderRows.map(o => <div key={o.id} className="border-b p-4"><div className="flex items-center justify-between"><b>{o.tracking_number}</b><span className="rounded bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">{o.status}</span></div><p className="mt-1 text-sm text-gray-500">{o.full_name} · {o.items.length} item(s)</p></div>)}</div></section></div></div>
}
