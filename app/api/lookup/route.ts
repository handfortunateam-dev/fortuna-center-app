import { NextRequest, NextResponse } from "next/server";
import { eq, or, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users, classes, students } from "@/db/schema";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get("type");

        if (!type) {
            return NextResponse.json(
                { success: false, message: "Type parameter is required" },
                { status: 400 }
            );
        }

        let data: { text: string; key: string; value: string; disabled?: boolean }[] = [];

        switch (type) {
            case "teachers":
                const teachers = await db
                    .select({
                        id: users.id,
                        name: users.name,
                    })
                    .from(users)
                    .where(eq(users.role, "TEACHER"));

                data = teachers.map((t) => ({
                    text: t.name,
                    key: t.id,
                    value: t.id,
                }));
                break;

            case "students":
                const studentList = await db
                    .select({
                        id: students.id,
                        firstName: students.firstName,
                        middleName: students.middleName,
                        lastName: students.lastName,
                        studentId: students.studentId,
                    })
                    .from(students)
                    .leftJoin(users, eq(students.userId, users.id))
                    .where(
                        or(
                            isNull(students.userId),
                            eq(users.role, "STUDENT")
                        )
                    );

                data = studentList.map((s) => {
                    const fullName = [s.firstName, s.middleName, s.lastName]
                        .filter(Boolean)
                        .join(" ");

                    return {
                        text: `${fullName} (${s.studentId})`,
                        key: s.id,
                        value: s.id,
                        disabled: false,
                    };
                });
                break;

            case "classes":
                const classList = await db
                    .select({
                        id: classes.id,
                        name: classes.name,
                        code: classes.code,
                    })
                    .from(classes)
                    .where(eq(classes.isActive, true));

                data = classList.map((c) => ({
                    text: `${c.name} (${c.code})`,
                    key: c.id,
                    value: c.id,
                }));
                break;

            default:
                return NextResponse.json(
                    { success: false, message: `Unknown lookup type: ${type}` },
                    { status: 400 }
                );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching lookup data:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch lookup data",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
