export function parseJsonArray(value: unknown): string[] {
    if (Array.isArray(value)) return value.map((item) => String(item));
    if (typeof value !== "string") return [];

    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[")) {
        try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
        } catch {
            return [];
        }
    }

    // Supports legacy/database values that store a direct URL or text value.
    return [trimmed];
}

export function parseJsonObject(value: unknown): Record<string, string> {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, String(item)]));
    }
    if (typeof value !== "string") return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? Object.fromEntries(Object.entries(parsed).map(([key, item]) => [key, String(item)]))
            : {};
    } catch {
        return {};
    }
}
