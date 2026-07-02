import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { students } from "@/db/schema/students.schema";
import { teachers } from "@/db/schema/teachers.schema";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        // 1. Get total counts
        const [{ usersCount }] = await db.select({ usersCount: sql<number>`count(*)` }).from(users);
        const [{ studentsCount }] = await db.select({ studentsCount: sql<number>`count(*)` }).from(students);
        const [{ teachersCount }] = await db.select({ teachersCount: sql<number>`count(*)` }).from(teachers);

        // 2. Get users grouped by role
        const rolesData = await db
            .select({
                role: users.role,
                value: sql<number>`count(*)`
            })
            .from(users)
            .groupBy(users.role);

        // 3. User registrations over time (last 6 months approximate grouping in JS for simplicity, or DB side)
        // Extract year/month from createdAt and group
        const registrationsData = await db
            .select({
                month: sql<string>`to_char(${users.createdAt}, 'YYYY-MM')`,
                count: sql<number>`count(*)`
            })
            .from(users)
            .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`)
            .orderBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`);

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalUsers: Number(usersCount),
                    totalStudents: Number(studentsCount),
                    totalTeachers: Number(teachersCount),
                },
                usersByRole: rolesData.map(r => ({ ...r, value: Number(r.value) })),
                registrations: registrationsData.map(r => ({ name: r.month, users: Number(r.count) }))
            }
        });
    } catch (error) {
        console.error("Error fetching analytics overview:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch analytics data" },
            { status: 500 }
        );
    }
}
