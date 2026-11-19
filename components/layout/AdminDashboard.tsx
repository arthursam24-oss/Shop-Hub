"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, PackageCheck, Activity, Store, Plus, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/layout/AuthProvider";
import { formatCurrency } from "@/lib/format";

export default function AdminDashboard() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [tab, setTab] = useState("overview");
    const [booths, setBooths] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [message, setMessage] = useState("");
    const [vendor, setVendor] = useState({ businessName: "", username: "", phone: "", password: "", paymentUrl: "", description: "" });

    useEffect(() => {
        if (!loading && !user) router.push("/account?mode=signin&next=%2Fadmin");
    }, [loading, user, router]);

    useEffect(() => {
        if (!supabase || !user) return;
        (async () => {
            const [{ data: boothRows }, { data: productRows }, { data: orderRows }] = await Promise.all([
                supabase.from("vendor_booths").select("*").order("created_at", { ascending: false }),
                supabase.from("products").select("*, category:categories(*), booth:vendor_booths(*)").order("created_at", { ascending: false }),
                supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false }),
            ]);
            setBooths(boothRows || []); setProducts(productRows || []); setOrders(orderRows || []);
        })();
    }, [user]);

    async function enrollVendor(event: React.FormEvent) {
        event.preventDefault(); setMessage("");
        const sessionResult = await supabase?.auth.getSession();
        const data = sessionResult?.data;
        const response = await fetch("/api/admin/vendors", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data?.session?.access_token || ""}` }, body: JSON.stringify(vendor) });
        const result = await response.json();
        if (!response.ok) setMessage(result.error || "Could not enroll vendor");
        else { setBooths([result.booth, ...booths]); setMessage(`Vendor created. Login: ${result.username} / Password: ${result.password}`); setVendor({ businessName: "", username: "", phone: "", password: "", paymentUrl: "", description: "" }); }
    }

    async function adminHeaders() {
        const sessionResult = await supabase?.auth.getSession();
        return { "Content-Type": "application/json", Authorization: `Bearer ${sessionResult?.data?.session?.access_token || ""}` };
    }

    async function approveBooth(id: string, status: string) {
        const response = await fetch("/api/admin/booths", { method: "PATCH", headers: await adminHeaders(), body: JSON.stringify({ id, status }) });
        if (response.ok) { const booth = await response.json(); setBooths(booths.map((item) => item.id === id ? booth : item)); }
    }

    async function updateProductStatus(id: string, status: string) {
        const response = await fetch("/api/admin/products", { method: "PATCH", headers: await adminHeaders(), body: JSON.stringify({ id, status }) });
        if (response.ok) { const product = await response.json(); setProducts(products.map((item) => item.id === id ? product : item)); }
    }

    const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pendingBooths = booths.filter((booth) => booth.status === "pending").length;

    return <main className="mx-auto max-w-[1380px] px-3 py-6 lg:px-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-sm text-gray-500">Administration</p><h1 className="text-2xl font-black">ShopHub Control Centre</h1></div><Settings size={24} className="text-[#7A1F33]" /></div>
        {message && <p className="mb-4 rounded bg-rose-50 p-3 text-sm text-[#7A1F33]">{message}</p>}
        <div className="mb-5 flex gap-2 overflow-x-auto"><button onClick={() => setTab("overview")} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === "overview" ? "bg-[#7A1F33] text-white" : "bg-white"}`}>Performance</button><button onClick={() => setTab("vendors")} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === "vendors" ? "bg-[#7A1F33] text-white" : "bg-white"}`}>Vendors</button><button onClick={() => setTab("products")} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === "products" ? "bg-[#7A1F33] text-white" : "bg-white"}`}>Products</button><button onClick={() => setTab("orders")} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === "orders" ? "bg-[#7A1F33] text-white" : "bg-white"}`}>Orders</button></div>
        {tab === "overview" && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric icon={Activity} label="Revenue" value={formatCurrency(revenue)} /><Metric icon={PackageCheck} label="Orders" value={String(orders.length)} /><Metric icon={Store} label="Vendors" value={String(booths.length)} /><Metric icon={Building2} label="Pending Booths" value={String(pendingBooths)} /></div>}
        {tab === "vendors" && <div className="grid gap-5 lg:grid-cols-[360px_1fr]"><section className="h-fit rounded-lg bg-white p-5"><h2 className="mb-4 flex items-center gap-2 font-black"><Plus size={18} />Enroll Vendor</h2><form onSubmit={enrollVendor} className="space-y-3"><input required placeholder="Business name" value={vendor.businessName} onChange={(e) => setVendor({ ...vendor, businessName: e.target.value })} className="w-full rounded border px-3 py-2" /><input required placeholder="Username or phone number" value={vendor.username} onChange={(e) => setVendor({ ...vendor, username: e.target.value })} className="w-full rounded border px-3 py-2" /><input placeholder="Phone number" value={vendor.phone} onChange={(e) => setVendor({ ...vendor, phone: e.target.value })} className="w-full rounded border px-3 py-2" /><input required minLength={8} placeholder="Generated password" value={vendor.password} onChange={(e) => setVendor({ ...vendor, password: e.target.value })} className="w-full rounded border px-3 py-2" /><input placeholder="Vendor payment gateway URL" value={vendor.paymentUrl} onChange={(e) => setVendor({ ...vendor, paymentUrl: e.target.value })} className="w-full rounded border px-3 py-2" /><textarea placeholder="Booth description" value={vendor.description} onChange={(e) => setVendor({ ...vendor, description: e.target.value })} className="w-full rounded border px-3 py-2" /><button className="w-full rounded bg-[#7A1F33] py-3 font-bold text-white">Create Vendor Login</button></form></section><section className="rounded-lg bg-white p-5"><h2 className="mb-4 font-black">Vendor Booths</h2><div className="space-y-3">{booths.map((booth) => <article key={booth.id} className="flex flex-wrap items-center gap-3 rounded border p-3"><div className="min-w-0 flex-1"><p className="font-bold">{booth.business_name}</p><p className="text-xs text-gray-500">{booth.username || booth.phone} · {booth.status}</p></div>{booth.status !== "approved" && <button onClick={() => approveBooth(booth.id, "approved")} className="rounded bg-green-600 px-3 py-2 text-xs font-bold text-white">Approve</button>}<button onClick={() => approveBooth(booth.id, "rejected")} className="rounded border px-3 py-2 text-xs font-bold text-red-700">Reject</button></article>)}</div></section></div>}
        {tab === "products" && <section className="rounded-lg bg-white p-5"><h2 className="mb-4 font-black">Vendor Products</h2><div className="space-y-3">{products.map((product) => <article key={product.id} className="flex items-center gap-3 rounded border p-3"><div className="flex-1"><p className="font-bold">{product.name}</p><p className="text-xs text-gray-500">{product.booth?.business_name || "Platform"} · {product.status || "approved"}</p></div><b>{formatCurrency(product.price)}</b>{product.status !== "approved" && <button onClick={() => updateProductStatus(product.id, "approved")} className="rounded bg-green-600 px-3 py-2 text-xs font-bold text-white">Approve</button>}<button onClick={() => updateProductStatus(product.id, "rejected")} className="rounded border px-3 py-2 text-xs font-bold text-red-700">Reject</button></article>)}</div></section>}
        {tab === "orders" && <section className="rounded-lg bg-white p-5"><h2 className="mb-4 font-black">Orders</h2><div className="space-y-3">{orders.map((order) => <article key={order.id} className="flex items-center justify-between rounded border p-3"><div><p className="font-bold">{order.tracking_number}</p><p className="text-xs text-gray-500">{order.full_name}</p></div><b>{formatCurrency(order.total)}</b></article>)}</div></section>}
    </main>;
}

function Metric({ icon: Icon, label, value }: { icon: any, label: string, value: string }) { return <div className="rounded-lg bg-white p-5"><Icon className="text-[#7A1F33]" /><p className="mt-3 text-sm text-gray-500">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div> }
