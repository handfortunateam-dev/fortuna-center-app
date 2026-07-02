import { db } from "@/db";
import { systemSettings } from "@/db/schema/settings.schema";
import { eq } from "drizzle-orm";
import { SETTINGS } from "@/constants/settings";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Checks if the request should be blocked by maintenance mode.
 * @returns {Promise<void>} - Redirects if blocked, else returns.
 */
export async function checkMaintenanceMode() {
    try {
        const headersList = await headers();
        const pathname = headersList.get("x-pathname");

        // If middleware didn't run or header is missing, fail open to prevent redirect loops
        if (!pathname) return;

        // Always allow access to maintenance page to avoid loops
        if (pathname.startsWith("/maintenance")) return;

        // Always allow API routes and critical assets
        if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
            return;
        }

        // Helper to unwrap standard or double-serialized values
        const unwrapSetting = (val: string | null) => {
            if (!val) return null;
            let current = val;
            for (let i = 0; i < 3; i++) {
                try {
                    const result = JSON.parse(current);
                    if (typeof result !== 'string') return result;
                    current = result;
                } catch {
                    break;
                }
            }
            return current;
        };

        // 1. Check Maintenance Mode Setting
        const maintenanceSetting = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, SETTINGS.MAINTENANCE_MODE),
        });

        // Resolve value robustly
        let isMaintenance = false;
        if (maintenanceSetting?.value) {
            const parsed = unwrapSetting(maintenanceSetting.value);
            isMaintenance = parsed === true || parsed === "true" || parsed === 1;
        }

        if (!isMaintenance) return; // Not in maintenance mode

        // 2. Check Whitelisted IPs
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

        const whitelistSetting = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, SETTINGS.ALLOWED_IPS),
        });

        let allowedIps: string[] = [];
        if (whitelistSetting?.value) {
            const parsed = unwrapSetting(whitelistSetting.value);
            if (Array.isArray(parsed)) {
                allowedIps = parsed;
            } else if (typeof parsed === 'string') {
                allowedIps = parsed.split(",").map(s => s.trim());
            }
        }

        // Check if current IP is allowed
        // Also allow localhost for development safety
        if (allowedIps.includes(ip) || ip === "::1" || ip === "127.0.0.1") {
            return; // Allowed
        }

        // Blocked -> Redirect to maintenance
        redirect("/maintenance");

    } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            throw error;
        }
        console.error("Error checking maintenance mode:", error);
        // In case of error (DB down?), maybe fail open or closed?
        // Let's fail open to avoid accidental lockout
    }
}
