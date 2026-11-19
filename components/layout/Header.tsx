"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Heart, HelpCircle, Menu, Search, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/components/layout/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";

export default function Header() {
    const router = useRouter();
    const cart = useStore((state) => state.cart);
    const wishlist = useStore((state) => state.wishlist);
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [accountOpen, setAccountOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const { user } = useAuth();

    useEffect(() => {
        if (!query.trim()) { setSuggestions([]); return; }
        const timer = setTimeout(async () => {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            setSuggestions(await response.json());
        }, 220);
        return () => clearTimeout(timer);
    }, [query]);

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (query.trim()) router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }

    async function signOut() {
        await supabase?.auth.signOut();
        setAccountOpen(false);
    }

    return (
        <header className="sticky top-0 z-50 bg-[#7A1F33] shadow-md">
            <div className="mx-auto flex max-w-[1380px] items-center gap-2 px-3 py-3 sm:gap-4 lg:px-6">
                <div className="relative">
                    <button onClick={() => setCategoryOpen(!categoryOpen)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/10 text-white" aria-label="Open categories"><Menu size={22} /></button>
                    {categoryOpen && <div className="absolute left-0 top-full mt-2 w-64 rounded-lg border bg-white py-2 shadow-2xl">
                        {[["Electronics", "electronics", "💻"], ["Fashion", "fashion", "👗"], ["Phones & Tablets", "phones-tablets", "📱"], ["Home & Office", "home-office", "🏠"], ["Health & Beauty", "health-beauty", "💄"], ["Groceries", "groceries", "🛒"]].map(([name, slug, icon]) => <Link key={slug} href={`/products?category=${slug}`} onClick={() => setCategoryOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-[#7A1F33]"><span className="text-lg">{icon}</span>{name}</Link>)}
                    </div>}
                </div>
                <Link href="/" className="shrink-0 text-xl font-black tracking-tight text-white sm:text-2xl">SHOP<span className="text-[#E9B872]">HUB</span></Link>
                <form onSubmit={submit} className="relative flex-1">
                    <div className="flex overflow-hidden rounded-md bg-white"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="min-w-0 flex-1 px-3 py-2.5 text-sm text-gray-900 outline-none sm:px-4" /><button aria-label="Search" className="m-1 rounded-md bg-[#7A1F33] px-3 text-white sm:px-4"><Search size={20} /></button></div>
                    {suggestions.length > 0 && <div className="absolute left-0 right-0 top-full mt-1 overflow-hidden rounded-md border bg-white shadow-xl">{suggestions.map((item) => <Link key={item.id} href={`/products/${item.slug}`} onClick={() => setQuery("")} className="block border-b px-4 py-2 text-sm text-gray-700 last:border-0 hover:bg-rose-50">{item.name}</Link>)}</div>}
                </form>
                <nav className="flex items-center gap-1 text-sm text-white">
                    <div className="relative"><button onClick={() => setAccountOpen(!accountOpen)} className="flex items-center gap-1 p-2"><User size={21} /><ChevronDown size={14} /></button>{accountOpen && <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border bg-white py-2 text-gray-800 shadow-xl">{user ? <><div className="truncate border-b px-4 py-2 text-xs text-gray-500">{user.email || user.phone}</div><Link href="/orders" className="block px-4 py-2 hover:bg-rose-50">My Orders</Link>{user.user_metadata?.role === "vendor" && <Link href="/vendor" className="block px-4 py-2 font-bold text-[#7A1F33] hover:bg-rose-50">Vendor Dashboard</Link>}<Link href="/account/profile" className="block px-4 py-2 hover:bg-rose-50">My Profile</Link>{user.user_metadata?.role === "admin" && <Link href="/admin" className="block px-4 py-2 hover:bg-rose-50">Admin Dashboard</Link>}<button onClick={signOut} className="block w-full px-4 py-2 text-left hover:bg-rose-50">Sign Out</button></> : <><Link href="/account?mode=signin" className="block px-4 py-2 hover:bg-rose-50">Sign In</Link><Link href="/account?mode=signup" className="block px-4 py-2 font-bold text-[#7A1F33] hover:bg-rose-50">Create Account</Link></>}</div>}</div>
                    <Link href="/help" className="hidden p-2 md:block" aria-label="Help"><HelpCircle size={21} /></Link>
                    <Link href="/wishlist" className="relative hidden p-2 sm:block" aria-label="Wishlist"><Heart size={21} />{wishlist.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-[#7A1F33]">{wishlist.length}</span>}</Link>
                    <Link href="/cart" className="relative p-2" aria-label="Cart"><ShoppingCart size={23} />{count > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E9B872] px-1 text-xs font-bold text-[#7A1F33]">{count}</span>}</Link>
                </nav>
            </div>
        </header>
    );
}
