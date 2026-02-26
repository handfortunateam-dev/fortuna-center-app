import { getAuthUser } from "@/lib/auth/getAuthUser";

export async function GET() {
    try {
        const user = await getAuthUser();

        if (!user) {
            return Response.json({ role: null }, { status: 401 });
        }

        return Response.json({ role: user.role }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user role:", error);
        return Response.json(
            { error: "Failed to fetch user role" },
            { status: 500 }
        );
    }
}