import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/services/userSyncService";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return Response.json({ role: null }, { status: 401 });
        }

        const user = await getUserByClerkId(userId);

        if (!user) {
            return Response.json({ role: "VISITOR" }, { status: 200 });
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