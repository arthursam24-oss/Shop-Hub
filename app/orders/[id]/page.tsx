import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { getSupabaseServer } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/format";

export const instant = false;

export default async function OrderConfirmation({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = getSupabaseServer();
    if (!supabase) notFound();
    const { data: order, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', id)
        .single();

    if (error || !order) notFound();

    const statusSteps = ["Pending", "Processing", "Shipped", "Delivered"];
    const currentStatus = statusSteps.includes(order.status) ? order.status : "Pending";
    const currentStep = statusSteps.indexOf(currentStatus);

    return (
        <div className="mx-auto max-w-[900px] px-3 py-8 lg:px-6">
            <div className="rounded-lg bg-white p-6 text-center sm:p-10">
                <CheckCircle2 size={64} className="mx-auto text-green-600" />
                <h1 className="mt-4 text-3xl font-black">Thank you, {order.full_name}!</h1>
                <p className="mt-2 text-gray-500">Your order has been placed successfully.</p>
                <div className="mx-auto mt-5 max-w-md rounded-lg bg-rose-50 p-4">
                    <p className="text-xs font-bold uppercase text-gray-500">Tracking Number</p>
                    <p className="mt-1 text-xl font-black text-[#f68b1e]">{order.tracking_number}</p>
                </div>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <section className="rounded-lg bg-white p-5">
                    <h2 className="mb-4 flex items-center gap-2 font-black">
                        <Package size={20} />Track Order
                    </h2>
                    <div className="relative px-1">
                        <div className="absolute left-[12%] right-[12%] top-4 h-1 bg-gray-200" />
                        <div className="absolute left-[12%] top-4 h-1 bg-[#7A1F33]" style={{ width: `${Math.max(0, currentStep) * 25.33}%` }} />
                        <div className="relative grid grid-cols-4">
                            {statusSteps.map((step, index) => {
                                const complete = index <= currentStep;
                                return (
                                    <div key={step} className="flex flex-col items-center text-center">
                                        <span className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white text-xs font-black ${complete ? "bg-[#7A1F33] text-white" : "bg-gray-200 text-gray-500"}`}>
                                            {complete ? "✓" : index + 1}
                                        </span>
                                        <span className={`mt-2 text-[11px] sm:text-xs ${complete ? "font-bold text-[#7A1F33]" : "text-gray-400"}`}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <p className="mt-4 rounded bg-rose-50 py-2 text-center text-sm font-bold text-[#7A1F33]">
                        Current status: {currentStatus}
                    </p>
                </section>
                <section className="rounded-lg bg-white p-5">
                    <h2 className="mb-3 font-black">Delivery Details</h2>
                    <p className="text-sm">{order.address}</p>
                    <p className="text-sm">{order.city}</p>
                    <p className="mt-2 text-sm text-gray-500">Phone: {order.phone}</p>
                </section>
            </div>
            <section className="mt-5 rounded-lg bg-white p-5">
                <h2 className="mb-3 font-black">Receipt</h2>
                {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-3 border-b py-3">
                        <img
                            src={item.image}
                            alt=""
                            className="h-16 w-16 rounded object-cover"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-bold">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <b className="text-sm">
                            {formatCurrency(item.price * item.quantity)}
                        </b>
                    </div>
                ))}
                <div className="ml-auto mt-4 max-w-xs space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <b>{formatCurrency(order.subtotal)}</b>
                    </div>
                    <div className="flex justify-between">
                        <span>Delivery</span>
                        <b>{formatCurrency(order.delivery_fee)}</b>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-lg">
                        <b>Total</b>
                        <b>{formatCurrency(order.total)}</b>
                    </div>
                </div>
            </section>
            <div className="mt-5 text-center">
                <Link
                    href="/orders"
                    className="mr-3 inline-block rounded border px-5 py-2.5 font-bold"
                >
                    View All Orders
                </Link>
                <Link
                    href="/products"
                    className="inline-block rounded bg-[#7A1F33] px-5 py-2.5 font-bold text-white"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}
