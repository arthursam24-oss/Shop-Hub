"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    quantity: number;
};

type Store = {
    cart: CartItem[];
    wishlist: string[];
    addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    updateQuantity: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    toggleWishlist: (id: string) => void;
};

export const useStore = create<Store>()(
    persist(
        (set) => ({
            cart: [],
            wishlist: [],
            addToCart: (item, quantity = 1) =>
                set((state) => {
                    const found = state.cart.find((entry) => entry.id === item.id);
                    return {
                        cart: found
                            ? state.cart.map((entry) =>
                                entry.id === item.id
                                    ? { ...entry, quantity: entry.quantity + quantity }
                                    : entry,
                            )
                            : [...state.cart, { ...item, quantity }],
                    };
                }),
            updateQuantity: (id, quantity) =>
                set((state) => ({
                    cart:
                        quantity <= 0
                            ? state.cart.filter((item) => item.id !== id)
                            : state.cart.map((item) =>
                                item.id === id ? { ...item, quantity } : item,
                            ),
                })),
            removeFromCart: (id) =>
                set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
            clearCart: () => set({ cart: [] }),
            toggleWishlist: (id) =>
                set((state) => ({
                    wishlist: state.wishlist.includes(id)
                        ? state.wishlist.filter((item) => item !== id)
                        : [...state.wishlist, id],
                })),
        }),
        { name: "shophub-store" },
    ),
);
