import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, type User } from "@/db/schema/users.schema";
import { students } from "@/db/schema/students.schema";
import { teachers } from "@/db/schema/teachers.schema";
import { and, eq, ilike, notInArray, isNotNull, count } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/getAuthUser";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
    try {

        const authenticatedUser = await getAuthUser();

        if (!authenticatedUser) {
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
        const role = searchParams.get("role");
        const id = searchParams.get("id");
        const fields = searchParams.get("fields")?.split(",").map((f: string) => f.trim());

        const excludeLinkedStudents =
            searchParams.get("excludeLinkedStudents") === "true" ||
            searchParams.get("unassigned") === "true";

        const excludeLinkedTeachers =
            searchParams.get("excludeLinkedTeachers") === "true";

        // Helper to filter object fields
        const filterFields = (obj: Record<string, unknown>, fields: string[] | undefined) => {
            if (!fields) return obj;
            const filtered: Record<string, unknown> = {};
            fields.forEach((f: string) => {
                if (f in obj) filtered[f] = obj[f];
            });
            return filtered;
        };

        // ================================
        // GET SINGLE USER
        // ================================

        if (id) {

            const user = await db
                .select()
                .from(users)
                .where(eq(users.id, id))
                .limit(1);

            if (!user.length) {

                return NextResponse.json(
                    {
                        success: false,
                        message: "User not found",
                    },
                    { status: 404 }
                );

            }

            const mappedUser = filterFields({
                id: user[0].id,
                email: user[0].email,
                username: null,
                fullName: user[0].name,
                imageUrl: user[0].image,
                role: user[0].role,
                clerkId: user[0].clerkId,
                createdAt: user[0].createdAt?.getTime(),
                updatedAt: user[0].updatedAt?.getTime(),
                isAdminEmployeeAlso: user[0].isAdminEmployeeAlso,
                emailVerified: true,
            }, fields);

            return NextResponse.json(
                {
                    success: true,
                    data: [mappedUser],
                },
                { status: 200 }
            );

        }


        // ================================
        // DATABASE USERS
        // ================================

        const whereConditions = [];

        if (role) {
            whereConditions.push(
                eq(users.role, role.toUpperCase() as User['role'])
            );
        }

        if (query) {
            whereConditions.push(ilike(users.name, `%${query}%`));
        }

        if (excludeLinkedStudents) {

            const linkedUserIds = await db
                .select({ userId: students.userId })
                .from(students)
                .where(isNotNull(students.userId));

            const ids = linkedUserIds
                .map(s => s.userId)
                .filter(Boolean) as string[];

            if (ids.length > 0) {
                whereConditions.push(notInArray(users.id, ids));
            }

        }

        if (excludeLinkedTeachers) {

            const linkedUserIds = await db
                .select({ userId: teachers.userId })
                .from(teachers)
                .where(isNotNull(teachers.userId));

            const ids = linkedUserIds
                .map(t => t.userId)
                .filter(Boolean) as string[];

            if (ids.length > 0) {
                whereConditions.push(notInArray(users.id, ids));
            }

        }

        const where =
            whereConditions.length > 0
                ? and(...whereConditions)
                : undefined;

        // Fetch from database
        const usersDB = await db
            .select()
            .from(users)
            .where(where)
            .limit(limit ? Number(limit) : 100)
            .offset(offset ? Number(offset) : 0);

        const totalCountResult = await db
            .select({ val: count() })
            .from(users)
            .where(where);

        const totalCount = Number(totalCountResult[0].val);

        // Transform Response primarily from Database
        // This fixes the "empty data" bug because we use the DB's filtered results
        const data = usersDB.map((user) => filterFields({
            id: user.id,
            email: user.email,
            username: user.email.split('@')[0], // Fallback username
            firstName: user.name.split(" ")[0] || "",
            lastName: user.name.split(" ").slice(1).join(" ") || "",
            fullName: user.name,
            imageUrl: user.image,
            role: user.role,
            clerkId: user.clerkId,
            createdAt: user.createdAt?.getTime(),
            updatedAt: user.updatedAt?.getTime(),
            isAdminEmployeeAlso: user.isAdminEmployeeAlso,
            emailVerified: true,
        }, fields));

        return NextResponse.json({
            success: true,
            data,
            totalCount,
            message: "Users fetched successfully",
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch users",
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}