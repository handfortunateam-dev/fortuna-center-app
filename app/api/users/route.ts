// import { users } from '@/db/schema/users.schema';
import { NextRequest, NextResponse } from "next/server";
import { getClerkUserList } from "@/lib/clerk";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
// import { users } from "@/db";
// GET - Fetch all users from Clerk
export async function GET(request: NextRequest) {
    try {
        // Check if user is authenticated
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const limit = searchParams.get("limit");
        const offset = searchParams.get("offset");
        const query = searchParams.get("query");
        const orderBy = searchParams.get("orderBy");

        const usersDataFromNeonDB = await db.select().from(users);

        console.log(usersDataFromNeonDB, 'usersDataFromNeonDB')

        // Valid orderBy values for Clerk
        const validOrderBy = ["-created_at", "created_at", "-updated_at", "updated_at"];
        const finalOrderBy = orderBy && validOrderBy.includes(orderBy) ? (orderBy as never) : undefined;

        const response = await getClerkUserList({
            limit: limit ? Number(limit) : 10,
            offset: offset ? Number(offset) : 0,
            query: query || undefined,
            orderBy: finalOrderBy,
        });

        // Transform Clerk user data to simpler format
        const usersDataClerk = response.data.map((user) => ({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress || null,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            imageUrl: user.imageUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastSignInAt: user.lastSignInAt,
            emailVerified: user.emailAddresses[0]?.verification?.status === "verified",
        }));


        console.log(usersDataClerk, 'usersDataClerk')

        return NextResponse.json(
            {
                success: true,
                data: usersDataClerk,
                totalCount: response.totalCount,
                message: "Users fetched successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch users",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}