"use client";

import { useState } from "react";
import { PackageSearch } from "lucide-react";

export default function OrderTracker({ initialTracking = "" }: { initialTracking?: string }) {
    const [tracking, setTracking] = useState(initialTracking);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const response = await fetch(`/api/track?tracking=${encodeURIComponent(tracking.trim())}`);
            const data = await response.json();
            if (!response.ok) setError(data.error || "Unable to track order");
            else setResult(data);
        } catch {
            setError("Unable to reach the tracking service");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="rounded-lg bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><PackageSearch className="text-[#7A1F33]" /><h2 className="text-lg font-black">Track Your Order</h2></div>
            <p className="mt-1 text-sm text-gray-500">Enter the tracking number shown after checkout.</p>
            <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input value={tracking} onChange={(event) => setTracking(event.target.value)} required placeholder="Example: SH12345678" className="min-w-0 flex-1 rounded-md border px-4 py-3 text-sm uppercase outline-none focus:border-[#7A1F33]" />
                <button disabled={loading} className="rounded-md bg-[#7A1F33] px-6 py-3 font-bold text-white disabled:opacity-60">{loading ? "Tracking..." : "Track Order"}</button>
            </form>
            {error && <p className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {result && (
                <div className="mt-5 rounded-lg border border-rose-100 bg-rose-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold">{result.tracking_number}</p><span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#7A1F33]">{result.status}</span></div>
                    <p className="mt-2 text-xs text-gray-500">Ordered {new Date(result.created_at).toLocaleString("en-GH")}</p>
                    <a href={`/orders/${result.id}`} className="mt-3 inline-block text-sm font-bold text-[#7A1F33]">View full order details →</a>
                </div>
            )}
        </section>
    );
}
