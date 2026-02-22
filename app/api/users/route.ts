import { type User } from './../../../db/schema/users.schema';
// import { users } from '@/db/schema/users.schema';
import { NextRequest, NextResponse } from "next/server";
import { getClerkUserList } from "@/lib/clerk";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { students } from "@/db/schema/students.schema";
import { teachers } from "@/db/schema/teachers.schema";
import { and, eq, ilike, notInArray, isNotNull } from "drizzle-orm";

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
        const role = searchParams.get("role");
        const source = searchParams.get("source");
        const id = searchParams.get("id"); // Database user ID
        const excludeLinkedStudents = searchParams.get("excludeLinkedStudents") === "true" || searchParams.get("unassigned") === "true";
        const excludeLinkedTeachers = searchParams.get("excludeLinkedTeachers") === "true";

        // If id is specified, fetch single user by database ID
        if (id) {
            const user = await db
                .select()
                .from(users)
                .where(eq(users.id, id))
                .limit(1);

            if (!user || user.length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "User not found",
                    },
                    { status: 404 }
                );
            }

            const userData = user[0];
            return NextResponse.json(
                {
                    success: true,
                    data: [{
                        id: userData.id,
                        email: userData.email,
                        name: userData.name,
                        role: userData.role,
                        clerkId: userData.clerkId,
                        image: userData.image,
                        createdAt: userData.createdAt,
                        updatedAt: userData.updatedAt,
                    }],
                    message: "User fetched successfully",
                },
                { status: 200 }
            );
        }

        // If role is specified or source is db, fetch from local DB
        if (role || source === "db") {
            // Build where clause
            const whereConditions = [];
            if (role) {
                whereConditions.push(eq(users.role, role.toUpperCase() as User['role']));
            }

            if (query) {
                whereConditions.push(ilike(users.name, `%${query}%`));
            }

            if (excludeLinkedStudents) {
                const linkedUserIds = await db
                    .select({ userId: students.userId })
                    .from(students)
                    .where(isNotNull(students.userId));

                const ids = linkedUserIds.map(s => s.userId).filter(Boolean) as string[];

                if (ids.length > 0) {
                    whereConditions.push(notInArray(users.id, ids));
                }
            }

            if (excludeLinkedTeachers) {
                const linkedUserIds = await db
                    .select({ userId: teachers.userId })
                    .from(teachers)
                    .where(isNotNull(teachers.userId));

                const ids = linkedUserIds.map(t => t.userId).filter(Boolean) as string[];

                if (ids.length > 0) {
                    whereConditions.push(notInArray(users.id, ids));
                }
            }

            const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

            const usersDB = await db
                .select()
                .from(users)
                .where(where)
                .limit(limit ? Number(limit) : 10)
                .offset(offset ? Number(offset) : 0);

            const usersDataDB = usersDB.map((user) => ({
                id: user.id, // UUID
                email: user.email,
                username: null, // DB doesn't store username separate usually, or uses email
                firstName: user.name.split(" ")[0] || "",
                lastName: user.name.split(" ").slice(1).join(" ") || "",
                fullName: user.name,
                imageUrl: user.image || "",
                createdAt: user.createdAt?.getTime() || Date.now(),
                updatedAt: user.updatedAt?.getTime() || Date.now(),
                lastSignInAt: null,
                emailVerified: true, // Assuming DB users are verified or we don't track it same way
                role: user.role,
                isAdminEmployeeAlso: user.isAdminEmployeeAlso,
            }));

            // Get count if needed, but for now just return data
            return NextResponse.json(
                {
                    success: true,
                    data: usersDataDB,
                    totalCount: usersDataDB.length, // Placeholder, usually requires separate count query
                    message: "Users fetched successfully from DB",
                },
                { status: 200 }
            );
        }

        // Default: Fetch from Clerk
        // Valid orderBy values for Clerk
        const validOrderBy = [
            "-created_at",
            "created_at",
            "-updated_at",
            "updated_at",
        ];
        const finalOrderBy =
            orderBy && validOrderBy.includes(orderBy) ? (orderBy as never) : undefined;

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