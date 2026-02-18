import { NextResponse } from "next/server";

export async function GET() {
    const VULTR_API_KEY = process.env.NEXT_VULTR_API_KEY;

    if (!VULTR_API_KEY) {
        return NextResponse.json(
            { error: "Vultr API key not configured" },
            { status: 500 }
        );
    }

    try {
        const response = await fetch("https://api.vultr.com/v2/billing/invoices", {
            headers: {
                Authorization: `Bearer ${VULTR_API_KEY}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Vultr API responded with status ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching Vultr invoices:", error);
        return NextResponse.json(
            { error: "Failed to fetch invoices" },
            { status: 500 }
        );
    }
}
