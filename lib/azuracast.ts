// lib/azuracast.ts
const AZURACAST_BASE_URL =
    process.env.NEXT_PUBLIC_AZURACAST_BASE_URL || "http://localhost";

const AZURACAST_API_KEY = process.env.AZURACAST_API_KEY;

if (!AZURACAST_API_KEY) {
    throw new Error("AZURACAST_API_KEY belum diset di environment.");
}

export async function azuraFetch(path: string, init: RequestInit = {}) {
    const res = await fetch(`${AZURACAST_BASE_URL}${path}`, {
        ...init,
        headers: {
            ...(init.headers || {}),
            Authorization: `Bearer ${AZURACAST_API_KEY}`,
        },
        // penting kalau kamu panggil dari route handler
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("AzuraCast error:", res.status, text);
        throw new Error(`AzuraCast API error: ${res.status}`);
    }

    return res;
}
