"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/components/layout/AuthProvider";

export default function CheckoutPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const cart = useStore((state) => state.cart);
    const clearCart = useStore((state) => state.clearCart);
    const [deliveryMethod, setDeliveryMethod] = useState("door");
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [submitting, setSubmitting] = useState(false);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = deliveryMethod === "door" ? (subtotal >= 100 ? 0 : 8) : 3;

    useEffect(() => {
        if (!loading && !user) router.push("/account?mode=signup&next=%2Fcheckout");
    }, [loading, user, router]);

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault(); setSubmitting(true);
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: form.get("fullName"), phone: form.get("phone"), address: form.get("address"), city: form.get("city"), deliveryMethod, paymentMethod, items: cart }) });
        const order = await response.json();
        if (order.id) {
            clearCart();
            if (order.payment_url && paymentMethod !== "cod") {
                const separator = order.payment_url.includes("?") ? "&" : "?";
                window.location.href = `${order.payment_url}${separator}order=${encodeURIComponent(order.tracking_number)}&amount=${encodeURIComponent(String(order.total))}`;
            } else {
                router.push(`/orders/${order.id}`);
            }
        } else setSubmitting(false);
    }

    if (!cart.length) return <div className="mx-auto max-w-[1380px] px-3 py-16 text-center"><div className="rounded-lg bg-white p-12"><h1 className="text-2xl font-black">Nothing to check out</h1><Link href="/products" className="mt-5 inline-block rounded bg-[#7A1F33] px-6 py-3 font-bold text-white">Continue Shopping</Link></div></div>;

    return <div className="mx-auto max-w-[1380px] px-3 py-5 lg:px-6"><h1 className="mb-4 text-2xl font-black">Checkout</h1><form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_350px]"><div className="space-y-4"><section className="rounded-lg bg-white p-5"><h2 className="mb-4 border-b pb-3 text-lg font-black">1. Shipping Details</h2><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Full Name<input required name="fullName" className="mt-1 w-full rounded border px-3 py-2.5 font-normal" /></label><label className="text-sm font-bold">Phone Number<input required name="phone" type="tel" className="mt-1 w-full rounded border px-3 py-2.5 font-normal" /></label><label className="text-sm font-bold sm:col-span-2">Delivery Address<input required name="address" className="mt-1 w-full rounded border px-3 py-2.5 font-normal" /></label><label className="text-sm font-bold sm:col-span-2">City / Region<input required name="city" className="mt-1 w-full rounded border px-3 py-2.5 font-normal" /></label></div></section><section className="rounded-lg bg-white p-5"><h2 className="mb-4 text-lg font-black">2. Delivery Method</h2><label className="flex cursor-pointer items-center gap-3 rounded border p-3"><input type="radio" checked={deliveryMethod === "door"} onChange={() => setDeliveryMethod("door")} /><div><b>Standard Door Delivery</b><p className="text-sm text-gray-500">Estimated 2–5 business days</p></div></label><label className="mt-2 flex cursor-pointer items-center gap-3 rounded border p-3"><input type="radio" checked={deliveryMethod === "pickup"} onChange={() => setDeliveryMethod("pickup")} /><div><b>Pickup Station</b><p className="text-sm text-gray-500">Collect in 2–3 business days</p></div></label></section><section className="rounded-lg bg-white p-5"><h2 className="mb-4 text-lg font-black">3. Payment Method</h2><div className="grid gap-2 sm:grid-cols-3">{[["cod", "Cash on Delivery"], ["mobile", "Mobile Money"], ["card", "Card"]].map(([value, label]) => <label key={value} className={`cursor-pointer rounded border p-3 text-sm ${paymentMethod === value ? "border-[#7A1F33] bg-rose-50" : ""}`}><input className="mr-2" type="radio" checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} />{label}</label>)}</div></section></div><aside className="h-fit rounded-lg bg-white p-5"><h2 className="border-b pb-3 font-black">Order Summary</h2><div className="max-h-64 space-y-3 overflow-auto py-4">{cart.map(item => <div key={item.id} className="flex gap-3"><img src={item.image} alt="" className="h-14 w-14 rounded object-cover" /><div className="flex-1"><p className="line-clamp-2 text-sm">{item.name}</p><p className="text-xs text-gray-500">Qty: {item.quantity}</p></div></div>)}</div><div className="space-y-2 border-t pt-4 text-sm"><div className="flex justify-between"><span>Subtotal</span><b>{formatCurrency(subtotal)}</b></div><div className="flex justify-between"><span>Delivery</span><b>{formatCurrency(deliveryFee)}</b></div><div className="flex justify-between border-t pt-3 text-lg"><b>Total</b><b>{formatCurrency(subtotal + deliveryFee)}</b></div></div><button disabled={submitting} className="mt-5 w-full rounded-md bg-[#7A1F33] py-3 font-bold text-white disabled:opacity-60">{submitting ? "Placing Order..." : "Place Order"}</button></aside></form></div>;
}
