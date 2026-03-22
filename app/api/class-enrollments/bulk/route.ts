import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/db";
import { students, classEnrollments, classes } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = await getAuthUser();
    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { classId, studentIds } = body;

    if (!classId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Class ID and a list of Student IDs are required" },
        { status: 400 }
      );
    }

    // Perform bulk enrollment in a transaction
    const result = await db.transaction(async (tx) => {
      // 1. Verify class exists
      const [classRecord] = await tx
        .select()
        .from(classes)
        .where(eq(classes.id, classId))
        .limit(1);

      if (!classRecord) {
        throw new Error("Target class not found");
      }

      // 2. Verify all students exist
      const existingStudents = await tx
        .select({ id: students.id })
        .from(students)
        .where(inArray(students.id, studentIds));

      if (existingStudents.length !== studentIds.length) {
        const foundIds = existingStudents.map(s => s.id);
        const missingIds = studentIds.filter(id => !foundIds.includes(id));
        throw new Error(`Some students were not found: ${missingIds.join(", ")}`);
      }

      // 3. Check for existing active enrollments
      const existingActive = await tx
        .select({ studentId: classEnrollments.studentId })
        .from(classEnrollments)
        .where(
          and(
            inArray(classEnrollments.studentId, studentIds),
            eq(classEnrollments.status, "active")
          )
        );

      if (existingActive.length > 0) {
        const activeStudentIds = existingActive.map(e => e.studentId);
        throw new Error(`Some students are already enrolled in an active class: ${activeStudentIds.join(", ")}`);
      }

      // 4. Create new active enrollments
      const newEnrollments = await tx
        .insert(classEnrollments)
        .values(
          studentIds.map((studentId) => ({
            studentId,
            classId,
            status: "active" as const,
            enrolledBy: authenticatedUser.id,
          }))
        )
        .returning();

      return {
        enrolledCount: studentIds.length,
        newEnrollments,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled ${result.enrolledCount} students`,
      data: result,
    });
  } catch (error) {
    console.error("Error in bulk enrollment:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to process bulk enrollment",
      },
      { status: 500 }
    );
  }
}
