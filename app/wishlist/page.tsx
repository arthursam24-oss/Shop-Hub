"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore } from "@/lib/store";

export default function WishlistPage() {
    const wishlist = useStore(state => state.wishlist);
    return <div className="mx-auto max-w-[1380px] px-3 py-5 lg:px-6"><h1 className="mb-4 text-2xl font-black">Saved Items</h1>{wishlist.length ? <div className="rounded-lg bg-white p-5 text-sm text-gray-600"><p>{wishlist.length} saved item(s). Open the product from your recent browsing or search to view details.</p></div> : <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg bg-white"><Heart size={58} className="text-gray-300" /><h2 className="mt-4 text-xl font-bold">Your wishlist is empty</h2><Link href="/products" className="mt-5 rounded-md bg-[#f68b1e] px-6 py-3 font-bold text-white">Continue Shopping</Link></div>}</div>
}
