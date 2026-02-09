import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";

export async function GET() {
    try {
        const user = await getAuthUser();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        console.error("Error fetching auth user:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
