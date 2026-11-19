"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Minus, Plus, Star, Truck, RotateCcw, Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { parseJsonArray, parseJsonObject } from "@/lib/json";
import Link from "next/link";

export default function ProductDetail({ product }: { product: any }) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [tab, setTab] = useState("description");
    const [size, setSize] = useState("");
    const [color, setColor] = useState("");
    const addToCart = useStore((state) => state.addToCart);
    const toggleWishlist = useStore((state) => state.toggleWishlist);
    const wishlist = useStore((state) => state.wishlist);
    const images = parseJsonArray(product.images);
    const sizes = parseJsonArray(product.sizes);
    const colors = parseJsonArray(product.colors);
    const specifications = parseJsonObject(product.specifications);
    const router = useRouter();
    const { user, loading } = useAuth();

    function add() {
        if (!loading && !user) {
            router.push(`/account?mode=signup&next=${encodeURIComponent(`/products/${product.slug}`)}`);
            toast("Sign in or create an account to add items");
            return;
        }
        if (loading) return;
        addToCart({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: images[0] || "" }, quantity);
        toast.success("Added to cart");
    }

    return (
        <div className="mx-auto max-w-[1380px] px-3 py-5 lg:px-6">
            <div className="grid gap-5 rounded-lg bg-white p-4 lg:grid-cols-[480px_minmax(0,1fr)_260px]">
                <div>
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100"><img src={images[selectedImage] || images[0]} alt={product.name} className="h-full w-full object-cover" /></div>
                    {images.length > 1 && <div className="mt-3 flex gap-2">{images.map((image: string, index: number) => <button key={image} onClick={() => setSelectedImage(index)} className={`h-16 w-16 overflow-hidden rounded border-2 ${selectedImage === index ? "border-[#7A1F33]" : "border-gray-200"}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div>}
                </div>
                <div>
                    <p className="text-sm text-[#7A1F33]">{product.brand}</p><h1 className="mt-1 text-2xl font-bold leading-tight">{product.name}</h1>
                    <div className="mt-3 flex items-center gap-2 text-sm"><span className="flex items-center"><Star size={16} className="fill-[#7A1F33] text-[#7A1F33]" /> {product.rating}</span><span className="text-gray-500">({product.reviewCount} reviews)</span></div>
                    <div className="mt-5 border-t pt-5"><div className="flex items-center gap-3"><span className="text-3xl font-black">{formatCurrency(product.price)}</span>{product.discount > 0 && <><span className="text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span><span className="rounded bg-orange-100 px-2 py-1 text-sm font-bold text-[#7A1F33]">-{product.discount}%</span></>}</div><p className="mt-2 text-sm text-green-600">{product.stock > 0 ? `In stock — ${product.stock} available` : "Out of stock"}</p></div>
                    {sizes.length > 0 && <div className="mt-5"><p className="mb-2 text-sm font-bold">Size</p><div className="flex flex-wrap gap-2">{sizes.map((item: string) => <button key={item} onClick={() => setSize(item)} className={`rounded border px-3 py-2 text-sm ${size === item ? "border-[#7A1F33] bg-orange-50" : ""}`}>{item}</button>)}</div></div>}
                    {colors.length > 0 && <div className="mt-5"><p className="mb-2 text-sm font-bold">Color</p><div className="flex flex-wrap gap-2">{colors.map((item: string) => <button key={item} onClick={() => setColor(item)} className={`rounded border px-3 py-2 text-sm ${color === item ? "border-[#7A1F33] bg-orange-50" : ""}`}>{item}</button>)}</div></div>}
                    <div className="mt-6 flex items-center gap-3"><div className="flex rounded border"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3" aria-label="Decrease quantity"><Minus size={16} /></button><span className="min-w-12 py-3 text-center">{quantity}</span><button onClick={() => setQuantity(quantity + 1)} className="p-3" aria-label="Increase quantity"><Plus size={16} /></button></div><button onClick={add} className="flex-1 rounded-md bg-[#7A1F33] px-6 py-3 font-bold text-white hover:bg-[#dd7710]">Add to Cart</button><button onClick={() => toggleWishlist(product.id)} className="rounded border p-3" aria-label="Wishlist"><Heart className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : ""} /></button></div>
                </div>
                <aside className="space-y-3"><div className="rounded-lg bg-gray-50 p-4"><Truck className="mb-2 text-[#7A1F33]" /><p className="font-bold">Delivery & Returns</p><p className="mt-1 text-sm text-gray-600">Estimated delivery: 2–5 business days</p></div><div className="rounded-lg bg-gray-50 p-4"><RotateCcw className="mb-2 text-[#7A1F33]" /><p className="font-bold">Easy Returns</p><p className="mt-1 text-sm text-gray-600">Free returns within 7 days.</p></div></aside>
            </div>
            <section className="mt-5 rounded-lg bg-white p-4"><div className="border-b"><button onClick={() => setTab("description")} className={`px-4 py-3 text-sm font-bold ${tab === "description" ? "border-b-2 border-[#7A1F33] text-[#7A1F33]" : ""}`}>Description</button><button onClick={() => setTab("specifications")} className={`px-4 py-3 text-sm font-bold ${tab === "specifications" ? "border-b-2 border-[#7A1F33] text-[#7A1F33]" : ""}`}>Specifications</button><button onClick={() => setTab("reviews")} className={`px-4 py-3 text-sm font-bold ${tab === "reviews" ? "border-b-2 border-[#7A1F33] text-[#7A1F33]" : ""}`}>Reviews</button></div>
                {tab === "description" && <p className="py-5 leading-7 text-gray-700">{product.description}</p>}{tab === "specifications" && <table className="my-4 w-full text-sm"><tbody>{Object.entries(specifications).map(([key, value]) => <tr key={key} className="border-b"><th className="w-1/3 py-3 text-left text-gray-500">{key}</th><td className="py-3">{String(value)}</td></tr>)}</tbody></table>}{tab === "reviews" && <div className="space-y-3 py-4">{product.reviews.length ? product.reviews.map((review: any) => <div key={review.id} className="border-b pb-3"><p className="font-bold">{review.author}</p><p className="text-sm text-yellow-500">{"★".repeat(review.rating)}</p><p className="mt-1 text-sm text-gray-600">{review.comment}</p></div>) : <p className="text-gray-500">No reviews yet.</p>}</div>}
            </section>
            {product.booth?.slug && <Link href={`/booths/${product.booth.slug}`} className="mt-2 inline-block text-sm font-bold text-[#7A1F33] underline">Sold by {product.booth.business_name}</Link>}
        </div>
    );
}
