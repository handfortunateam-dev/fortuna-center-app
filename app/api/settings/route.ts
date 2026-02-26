import { NextRequest, NextResponse } from "next/server";
import { settingsService } from "@/services/settingsService";
import { isAdmin, getAuthUser } from "@/lib/auth/getAuthUser";

export async function GET(request: NextRequest) {
    try {
        const authenticatedUser = await getAuthUser();
        if (!authenticatedUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Check admin access for system settings
        const isUserAdmin = await isAdmin();
        if (!isUserAdmin) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const searchParams = request.nextUrl.searchParams;
        const format = searchParams.get("format");

        let settings;
        if (format === "list") {
            settings = await settingsService.listAll();
        } else {
            settings = await settingsService.getAll();
        }

        return NextResponse.json({ success: true, data: settings });
    } catch (error: unknown) {
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const authenticatedUser = await getAuthUser();
        if (!authenticatedUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const isUserAdmin = await isAdmin();
        if (!isUserAdmin) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { settings } = body;

        if (!settings || typeof settings !== "object") {
            return NextResponse.json(
                { success: false, message: "Invalid payload" },
                { status: 400 }
            );
        }

        // Update each setting
        for (const [key, value] of Object.entries(settings)) {
            await settingsService.set(key, value);
        }

        return NextResponse.json({
            success: true,
            message: "Settings updated successfully",
        });
    } catch (error: unknown) {
        console.error("Error updating settings:", error);
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Failed to update settings" },
            { status: 500 }
        );
    }
}
