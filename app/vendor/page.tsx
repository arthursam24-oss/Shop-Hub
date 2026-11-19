"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, LockKeyhole, BadgePercent, Boxes } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/layout/AuthProvider";
import { formatCurrency } from "@/lib/format";

export default function VendorDashboard() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [booth, setBooth] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [message, setMessage] = useState("");
    const [password, setPassword] = useState("");
    const [form, setForm] = useState({ name: "", price: "", originalPrice: "", stock: "", promo: "", categoryId: "", description: "", imageUrl: "" });

    useEffect(() => {
        if (!loading && !user) router.push("/account?mode=signin&next=%2Fvendor");
    }, [loading, user, router]);

    useEffect(() => {
        if (!user || !supabase) return;
        (async () => {
            const [{ data: boothRow }, { data: categoryRows }] = await Promise.all([
                supabase.from("vendor_booths").select("*").eq("owner_id", user.id).maybeSingle(),
                supabase.from("categories").select("*").order("name"),
            ]);
            setBooth(boothRow);
            setCategories(categoryRows || []);
            if (boothRow) {
                const { data: productRows } = await supabase.from("products").select("*").eq("vendor_id", boothRow.id).order("created_at", { ascending: false });
                setProducts(productRows || []);
            }
        })();
    }, [user]);

    async function authorizationHeaders() {
        const sessionResult = await supabase?.auth.getSession();
        const data = sessionResult?.data;
        return { "Content-Type": "application/json", Authorization: `Bearer ${data?.session?.access_token || ""}` };
    }

    async function changePassword(event: React.FormEvent) {
        event.preventDefault();
        const headers = await authorizationHeaders();
        const response = await fetch("/api/vendor/password", { method: "PATCH", headers, body: JSON.stringify({ password }) });
        const data = await response.json();
        setMessage(response.ok ? "Password changed successfully." : data.error || "Could not change password");
        if (response.ok) setPassword("");
    }

    async function submitProduct(event: React.FormEvent) {
        event.preventDefault();
        setMessage("");
        const headers = await authorizationHeaders();
        const promo = Math.max(0, Math.min(100, Number(form.promo || 0)));
        const salePrice = Number(form.price);
        const originalPrice = promo > 0 ? salePrice / (1 - promo / 100) : salePrice;
        const response = await fetch("/api/vendor/products", { method: "POST", headers, body: JSON.stringify({ name: form.name, price: salePrice, originalPrice, discount: promo, stock: Number(form.stock), isFlashSale: promo > 0, categoryId: form.categoryId, description: form.description, images: form.imageUrl ? [form.imageUrl] : [] }) });
        const data = await response.json();
        if (!response.ok) setMessage(data.error || "Could not add product");
        else { setProducts([data, ...products]); setMessage("Product submitted for admin approval."); setForm({ name: "", price: "", originalPrice: "", stock: "", promo: "", categoryId: "", description: "", imageUrl: "" }); }
    }

    async function updateProduct(id: string, changes: any) {
        const headers = await authorizationHeaders();
        const response = await fetch("/api/vendor/products", { method: "PATCH", headers, body: JSON.stringify({ id, ...changes }) });
        if (response.ok) { const updated = await response.json(); setProducts(products.map((item) => item.id === id ? updated : item)); }
    }

    if (loading) return <div className="p-10 text-center">Loading vendor dashboard...</div>;
    if (!booth) return <div className="mx-auto max-w-xl p-10"><div className="rounded-lg bg-white p-8 text-center"><h1 className="text-xl font-black">Vendor booth not found</h1><p className="mt-2 text-sm text-gray-500">Ask the administrator to enroll and approve your booth.</p></div></div>;

    return <main className="mx-auto max-w-[1380px] px-3 py-6 lg:px-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-gray-500">Vendor Dashboard</p><h1 className="text-2xl font-black">{booth.business_name}</h1></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${booth.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{booth.status}</span></div>
        {message && <p className="mb-4 rounded bg-rose-50 p-3 text-sm text-[#7A1F33]">{message}</p>}
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]"><div className="space-y-5"><section className="rounded-lg bg-white p-5"><h2 className="mb-4 flex items-center gap-2 font-black"><PackagePlus size={20} />Add Product</h2><form onSubmit={submitProduct} className="space-y-3"><input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded border px-3 py-2" /><select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full rounded border px-3 py-2"><option value="">Select category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><div className="grid grid-cols-2 gap-2"><input required type="number" min="0.01" step="0.01" placeholder="Sale price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded border px-3 py-2" /><input required type="number" min="0" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="rounded border px-3 py-2" /></div><div className="relative"><BadgePercent className="absolute left-3 top-2.5 text-gray-400" size={17} /><input type="number" min="0" max="100" placeholder="Promo percentage" value={form.promo} onChange={(e) => setForm({ ...form, promo: e.target.value })} className="w-full rounded border py-2 pl-9 pr-3" /></div><textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded border px-3 py-2" /><input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full rounded border px-3 py-2" /><button className="w-full rounded bg-[#7A1F33] py-3 font-bold text-white">Submit Product</button></form></section><section className="rounded-lg bg-white p-5"><h2 className="mb-4 flex items-center gap-2 font-black"><LockKeyhole size={20} />Change Password</h2><form onSubmit={changePassword} className="flex gap-2"><input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="min-w-0 flex-1 rounded border px-3 py-2" /><button className="rounded bg-[#7A1F33] px-4 font-bold text-white">Save</button></form></section></div><section className="rounded-lg bg-white p-5"><h2 className="mb-4 flex items-center gap-2 font-black"><Boxes size={20} />My Products</h2>{products.length === 0 ? <p className="py-10 text-center text-gray-500">No products yet.</p> : <div className="space-y-3">{products.map((product) => <article key={product.id} className="flex flex-wrap items-center gap-3 rounded border p-3"><div className="min-w-0 flex-1"><p className="font-bold">{product.name}</p><p className="text-xs text-gray-500">{product.status} · Stock: {product.stock}</p></div><input type="number" step="0.01" defaultValue={product.price} onBlur={(e) => updateProduct(product.id, { price: e.target.value })} aria-label="Price" className="w-28 rounded border px-2 py-2" /><input type="number" defaultValue={product.stock} onBlur={(e) => updateProduct(product.id, { stock: e.target.value })} aria-label="Stock" className="w-20 rounded border px-2 py-2" /><b>{formatCurrency(product.price)}</b></article>)}</div>}</section></div>
    </main>;
}
