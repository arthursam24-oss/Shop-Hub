"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Heart, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/components/layout/AuthProvider";

export type ProductCardData = {
    id: string; name: string; slug: string; price: number; originalPrice: number;
    discount: number; rating: number; reviewCount: number; images: string; stock: number;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
    const addToCart = useStore((state) => state.addToCart);
    const toggleWishlist = useStore((state) => state.toggleWishlist);
    const wishlist = useStore((state) => state.wishlist);
    const images = JSON.parse(product.images || "[]") as string[];
    const router = useRouter();
    const { user, loading } = useAuth();

    function add() {
        if (!loading && !user) {
            router.push(`/account?mode=signup&next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            toast("Sign in or create an account to add items");
            return;
        }
        if (loading) return;
        addToCart({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: images[0] || "" });
        toast.success("Added to cart");
    }

    return (
        <article className="group relative rounded-lg bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-3">
            <button onClick={() => toggleWishlist(product.id)} aria-label="Toggle wishlist" className="absolute right-3 top-3 z-10 rounded-full bg-white p-1.5 shadow">
                <Heart size={18} className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-500"} />
            </button>
            {product.discount > 0 && <span className="absolute left-2 top-2 z-10 rounded bg-[#7A1F33] px-2 py-1 text-xs font-bold text-white">-{product.discount}%</span>}
            <Link href={`/products/${product.slug}`} className="block">
                <div className="aspect-square overflow-hidden rounded-md bg-gray-100">
                    <img src={images[0] || ""} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                </div>
                <h3 className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-gray-800">{product.name}</h3>
            </Link>
            <div className="mt-1">
                <p className="font-bold text-gray-900">{formatCurrency(product.price)}</p>
                {product.originalPrice > product.price && <p className="text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</p>}
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <Star size={13} className="fill-[#E9B872] text-[#E9B872]" /><span>{product.rating}</span><span>({product.reviewCount})</span>
                </div>
            </div>
            <button onClick={add} className="mt-3 w-full rounded-md bg-[#7A1F33] py-2 text-sm font-bold text-white opacity-100 transition hover:bg-[#5C1727] sm:opacity-0 sm:group-hover:opacity-100">Add to Cart</button>
        </article>
    );
}
