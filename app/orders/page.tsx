import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/format";
import OrderTracker from "@/components/cart/OrderTracker";

export const instant = false;

export default async function OrdersPage() {
    const supabase = getSupabaseServer();
    if (!supabase) return <div className="mx-auto max-w-[1000px] p-8">Supabase is not configured.</div>;

    const { data: orders, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

    if (error) {
        const details = {
            code: (error as any).code,
            message: (error as any).message,
            details: (error as any).details,
            hint: (error as any).hint,
        };
        console.error("Supabase orders query failed", details);
        return (
            <div className="mx-auto max-w-[1000px] px-3 py-12">
                <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                    <h1 className="text-xl font-black text-red-800">Orders database is not ready</h1>
                    <p className="mt-2 text-sm text-red-700">
                        Run <code>supabase/schema.sql</code> in the Supabase SQL editor, then refresh this page.
                    </p>
                    <p className="mt-3 text-xs text-red-700">{details.code || "Supabase error"}: {details.message || "Could not load orders"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1000px] px-3 py-5 lg:px-6">
            <h1 className="mb-4 text-2xl font-black">My Orders</h1>
            <OrderTracker />
            {!orders.length ? (
                <div className="rounded-lg bg-white p-12 text-center">
                    <h2 className="text-xl font-bold">No orders yet</h2>
                    <Link
                        href="/products"
                        className="mt-5 inline-block rounded bg-[#7A1F33] px-5 py-2.5 font-bold text-white"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/orders/${order.id}`}
                            className="block rounded-lg bg-white p-5 hover:shadow"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Tracking number
                                    </p>
                                    <p className="font-black">{order.tracking_number}</p>
                                </div>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${order.status === "Delivered"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {order.status}
                                </span>
                            </div>
                            <div className="mt-3 flex justify-between border-t pt-3 text-sm">
                                <span>
                                    {order.items.length} item(s) ·{" "}
                                    {new Date(order.created_at).toLocaleDateString()}
                                </span>
                                <b>{formatCurrency(order.total)}</b>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
