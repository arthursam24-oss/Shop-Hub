"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
    const cart = useStore((state) => state.cart);
    const updateQuantity = useStore((state) => state.updateQuantity);
    const removeFromCart = useStore((state) => state.removeFromCart);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = subtotal > 0 ? (subtotal >= 100 ? 0 : 8) : 0;

    if (!cart.length) return <div className="mx-auto max-w-[1380px] px-3 py-16"><div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg bg-white"><ShoppingBag size={58} className="text-gray-300" /><h1 className="mt-4 text-2xl font-black">Your cart is empty</h1><p className="mt-2 text-gray-500">Browse our store and add something you love.</p><Link href="/products" className="mt-5 rounded-md bg-[#f68b1e] px-6 py-3 font-bold text-white">Continue Shopping</Link></div></div>;

    return (
        <div className="mx-auto max-w-[1380px] px-3 py-5 lg:px-6"><h1 className="mb-4 text-2xl font-black">Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</h1><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><div className="space-y-3">{cart.map((item) => <article key={item.id} className="flex gap-3 rounded-lg bg-white p-3 sm:gap-5"><img src={item.image} alt={item.name} className="h-24 w-24 rounded object-cover sm:h-32 sm:w-32" /><div className="flex flex-1 flex-col"><Link href={`/products/${item.slug}`} className="line-clamp-2 font-bold hover:text-[#f68b1e]">{item.name}</Link><p className="mt-2 font-black">{formatCurrency(item.price)}</p><div className="mt-auto flex items-end justify-between"><div className="flex items-center rounded border"><button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2"><Minus size={14} /></button><span className="min-w-10 text-center text-sm">{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2"><Plus size={14} /></button></div><button onClick={() => removeFromCart(item.id)} className="flex items-center gap-1 text-sm text-red-600"><Trash2 size={16} />Remove</button></div></div></article>)}</div><aside className="h-fit rounded-lg bg-white p-5"><h2 className="border-b pb-3 text-lg font-black">Cart Summary</h2><div className="space-y-3 py-4 text-sm"><div className="flex justify-between"><span>Subtotal</span><b>{formatCurrency(subtotal)}</b></div><div className="flex justify-between"><span>Estimated Delivery</span><b>{delivery ? formatCurrency(delivery) : "Free"}</b></div></div><div className="flex justify-between border-t pt-4 text-lg font-black"><span>Total</span><span>{formatCurrency(subtotal + delivery)}</span></div><Link href="/checkout" className="mt-5 block rounded-md bg-[#f68b1e] py-3 text-center font-bold text-white">Proceed to Checkout</Link></aside></div></div>
    );
}
