import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { 
  classAttendances, 
  classSessions, 
  classEnrollments, 
  classSchedules,
  classes,
  users 
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;

    // Get class info
    const classInfo = await db.query.classes.findFirst({
      where: eq(classes.id, classId),
    });

    if (!classInfo) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Get all students enrolled in this class
    const enrolledStudents = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(classEnrollments)
      .innerJoin(users, eq(classEnrollments.studentId, users.id))
      .where(eq(classEnrollments.classId, classId));

    // Get all sessions for this class
    const sessions = await db
      .select({
        id: classSessions.id,
        date: classSessions.date,
        status: classSessions.status,
        actualStartTime: classSessions.actualStartTime,
        actualEndTime: classSessions.actualEndTime,
        scheduleId: classSessions.scheduleId,
      })
      .from(classSessions)
      .innerJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
      .where(eq(classSchedules.classId, classId))
      .orderBy(desc(classSessions.date));

    // Get all attendance records for this class
    const attendanceRecords = await db
      .select({
        id: classAttendances.id,
        sessionId: classAttendances.sessionId,
        studentId: classAttendances.studentId,
        status: classAttendances.status,
        notes: classAttendances.notes,
        checkedInAt: classAttendances.checkedInAt,
        recordedAt: classAttendances.recordedAt,
      })
      .from(classAttendances)
      .innerJoin(classSessions, eq(classAttendances.sessionId, classSessions.id))
      .innerJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
      .where(eq(classSchedules.classId, classId));

    // Build attendance matrix
    const attendanceMatrix = enrolledStudents.map((student) => {
      const studentAttendance = sessions.map((session) => {
        const record = attendanceRecords.find(
          (r) => r.sessionId === session.id && r.studentId === student.id
        );
        return {
          sessionId: session.id,
          sessionDate: session.date,
          sessionStatus: session.status,
          attendanceStatus: record?.status || null,
          notes: record?.notes || null,
          checkedInAt: record?.checkedInAt || null,
        };
      });

      // Calculate stats
      const stats = {
        present: studentAttendance.filter((a) => a.attendanceStatus === "present").length,
        late: studentAttendance.filter((a) => a.attendanceStatus === "late").length,
        absent: studentAttendance.filter((a) => a.attendanceStatus === "absent").length,
        excused: studentAttendance.filter((a) => a.attendanceStatus === "excused").length,
        sick: studentAttendance.filter((a) => a.attendanceStatus === "sick").length,
      };

      const totalRecorded = stats.present + stats.late + stats.absent + stats.excused + stats.sick;
      const attendanceRate = totalRecorded > 0 
        ? Math.round(((stats.present + stats.late) / totalRecorded) * 100)
        : 0;

      return {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
        },
        attendance: studentAttendance,
        stats,
        attendanceRate,
      };
    });

    return NextResponse.json({
      class: {
        id: classInfo.id,
        name: classInfo.name,
        code: classInfo.code,
        description: classInfo.description,
      },
      sessions: sessions.map((s) => ({
        id: s.id,
        date: s.date,
        status: s.status,
        actualStartTime: s.actualStartTime,
        actualEndTime: s.actualEndTime,
      })),
      totalStudents: enrolledStudents.length,
      totalSessions: sessions.length,
      attendanceData: attendanceMatrix,
    });
  } catch (error) {
    console.error("Error fetching class attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance data" },
      { status: 500 }
    );
  }
}
