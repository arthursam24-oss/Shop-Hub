import { getSupabaseServer } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const items = body.items as Array<{ id: string; name: string; image: string; price: number; quantity: number }>;

    if (!items?.length) {
        return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    if (!supabase) {
        return Response.json({ error: "Supabase is not configured" }, { status: 503 });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = body.deliveryMethod === "pickup" ? 3 : subtotal >= 100 ? 0 : 8;
    const tracking = `SH${Date.now().toString().slice(-8)}`;

    const { data: order, error } = await supabase
        .from("orders")
        .insert({
            tracking_number: tracking,
            full_name: String(body.fullName),
            phone: String(body.phone),
            address: String(body.address),
            city: String(body.city),
            delivery_method: String(body.deliveryMethod),
            payment_method: String(body.paymentMethod),
            status: "Pending",
            subtotal,
            delivery_fee: deliveryFee,
            total: subtotal + deliveryFee,
        })
        .select("*")
        .single();

    if (error || !order) {
        return Response.json({ error: error?.message || "Could not create order" }, { status: 500 });
    }

    const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
        return Response.json({ error: itemsError.message }, { status: 500 });
    }

    return Response.json(order);
}

export async function GET() {
    const supabase = getSupabaseServer();

    if (!supabase) {
        return Response.json([]);
    }

    const { data: orders } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

    return Response.json(orders || []);
}
