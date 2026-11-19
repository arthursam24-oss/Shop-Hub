"use client";
import { useEffect, useState } from "react";

export default function FlashCountdown({ end }: { end: string }) {
    const [text, setText] = useState("Calculating...");
    useEffect(() => {
        const tick = () => {
            const diff = Math.max(0, new Date(end).getTime() - Date.now());
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setText(`${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`);
        };
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [end]);
    return <span className="rounded bg-[#2d2d2d] px-3 py-1 font-mono text-sm text-white">{text}</span>;
}
