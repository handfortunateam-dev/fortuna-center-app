import { NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema/settings.schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Only fetch safe, public settings
        const keysToFetch = ["auth_provider", "maintenance_mode"];

        const settings = await db.query.systemSettings.findMany({
            where: or(...keysToFetch.map(key => eq(systemSettings.key, key))),
        });

        const config: Record<string, any> = {};

        // Default values
        config["auth_provider"] = "clerk";
        config["maintenance_mode"] = false;

        settings.forEach(s => {
            let val: any = s.value;
            // Simple unwrap logic
            if (val && typeof val === 'string') {
                if (val.startsWith('"') && val.endsWith('"')) {
                    try { val = JSON.parse(val); } catch { }
                }
                // Double unwrap if needed for weird "true" values
                if (typeof val === 'string' && (val === 'true' || val === 'false')) {
                    val = val === 'true';
                }
            }
            config[s.key] = val;
        });

        return NextResponse.json({ success: true, data: config });
    } catch (error) {
        console.error("Public config error:", error);
        return NextResponse.json({ success: false, message: "Failed to load config" }, { status: 500 });
    }
}
