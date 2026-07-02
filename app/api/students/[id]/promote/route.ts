import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { students, classEnrollments, classes } from "@/db/schema";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authenticatedUser = await getAuthUser();
        if (!authenticatedUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: studentId } = await params;
        const body = await request.json();
        const { classId } = body;

        if (!classId) {
            return NextResponse.json(
                { success: false, message: "Target Class ID is required" },
                { status: 400 }
            );
        }

        // Perform promotion in a transaction
        const result = await db.transaction(async (tx) => {
            // 1. Verify target class and get its level
            const [targetClass] = await tx
                .select()
                .from(classes)
                .where(eq(classes.id, classId))
                .limit(1);

            if (!targetClass) {
                throw new Error("Target class not found");
            }

            // 2. Mark current active enrollments as completed
            await tx
                .update(classEnrollments)
                .set({ status: "completed" })
                .where(
                    and(
                        eq(classEnrollments.studentId, studentId),
                        eq(classEnrollments.status, "active")
                    )
                );

            // 3. Create new enrollment
            const [newEnrollment] = await tx
                .insert(classEnrollments)
                .values({
                    studentId,
                    classId,
                    status: "active",
                    enrolledBy: authenticatedUser.id,
                })
                .returning();

            // 4. Update student's current level
            const [updatedStudent] = await tx
                .update(students)
                .set({
                    currentLevel: targetClass.level,
                    updatedAt: new Date(),
                })
                .where(eq(students.id, studentId))
                .returning();

            return { newEnrollment, updatedStudent };
        });

        return NextResponse.json({
            success: true,
            message: "Student promoted successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error promoting student:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Failed to promote student",
            },
            { status: 500 }
        );
    }
}
