export const CURRENCY: "$" | "₵" | "₦" = "$";

export function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: CURRENCY === "₵" ? "GHS" : CURRENCY === "₦" ? "NGN" : "USD",
    }).format(value);
}
