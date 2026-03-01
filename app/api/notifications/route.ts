import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { UserRole } from "@/enums/common";
import { getUserByClerkId } from "@/services/userSyncService";
import { classSessions, classSchedules, classAttendances, classes, posts, coursePayments, scheduleTeachers, students } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { addDays, subDays } from "date-fns";

export async function GET() {
    try {
        const { userId } = await auth();
        
        let userRole: UserRole | null = null;
        let userDbId: string | null = null;

        if (userId) {
            const dbUser = await getUserByClerkId(userId);
            if (dbUser) {
                userRole = dbUser.role as UserRole;
                userDbId = dbUser.id.toString();
            }
        }

        const activities: Array<{
            id: string;
            type: string;
            title: string;
            description: string;
            timestamp: Date;
            isRead: boolean;
        }> = [];

        // If no user found, return empty notifications
        if (!userId || !userDbId) {
            return NextResponse.json({
                success: true,
                data: [],
            });
        }

        // STUDENT: Return empty (or student-specific notifications in the future)
        if (userRole === UserRole.STUDENT) {
            return NextResponse.json({
                success: true,
                data: [],
            });
        }

        // TEACHER: Only see notifications related to their own activities
        if (userRole === UserRole.TEACHER && userDbId) {
            // TEACHER: Only see notifications related to their own activities
            
            // 1. Sessions assigned to this teacher (through schedule_teachers or direct teacherId)
            const teacherSessions = await db
                .select({
                    id: classSessions.id,
                    date: classSessions.date,
                    status: classSessions.status,
                    className: classes.name,
                    generatedAt: classSessions.generatedAt,
                })
                .from(classSessions)
                .innerJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
                .innerJoin(classes, eq(classSchedules.classId, classes.id))
                .innerJoin(scheduleTeachers, eq(classSchedules.id, scheduleTeachers.scheduleId))
                .where(
                    and(
                        eq(scheduleTeachers.teacherId, userDbId),
                        eq(classSessions.status, "scheduled")
                    )
                )
                .orderBy(desc(classSessions.date))
                .limit(10);

            for (const session of teacherSessions) {
                activities.push({
                    id: `session-${session.id}`,
                    type: "session",
                    title: "Your Upcoming Session",
                    description: `${session.className || "Class"} scheduled on ${session.date}`,
                    timestamp: session.generatedAt || new Date(),
                    isRead: true,
                });
            }

            // Also get sessions where teacherId is directly set
            const directTeacherSessions = await db
                .select({
                    id: classSessions.id,
                    date: classSessions.date,
                    status: classSessions.status,
                    className: classes.name,
                    generatedAt: classSessions.generatedAt,
                })
                .from(classSessions)
                .innerJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
                .innerJoin(classes, eq(classSchedules.classId, classes.id))
                .where(
                    and(
                        eq(classSessions.teacherId, userDbId),
                        eq(classSessions.status, "scheduled")
                    )
                )
                .orderBy(desc(classSessions.date))
                .limit(10);

            for (const session of directTeacherSessions) {
                const exists = activities.find(a => a.id === `session-${session.id}`);
                if (!exists) {
                    activities.push({
                        id: `session-${session.id}`,
                        type: "session",
                        title: "Your Upcoming Session",
                        description: `${session.className || "Class"} scheduled on ${session.date}`,
                        timestamp: session.generatedAt || new Date(),
                        isRead: true,
                    });
                }
            }

            // 2. Attendance sessions recorded by this teacher
            const teacherAttendance = await db
                .select({
                    id: classAttendances.id,
                    status: classAttendances.status,
                    recordedAt: classAttendances.recordedAt,
                    sessionDate: classSessions.date,
                    className: classes.name,
                })
                .from(classAttendances)
                .innerJoin(classSessions, eq(classAttendances.sessionId, classSessions.id))
                .innerJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
                .innerJoin(classes, eq(classSchedules.classId, classes.id))
                .where(eq(classAttendances.recordedBy, userDbId))
                .orderBy(desc(classAttendances.recordedAt))
                .limit(10);

            for (const attendance of teacherAttendance) {
                activities.push({
                    id: `attendance-${attendance.id}`,
                    type: "attendance",
                    title: "Attendance Recorded",
                    description: `Attendance for ${attendance.className || "class"} on ${attendance.sessionDate}: ${attendance.status}`,
                    timestamp: attendance.recordedAt || new Date(),
                    isRead: true,
                });
            }

            // 3. Reminder: Sessions scheduled in the next 2 days
            const today = new Date();
            const twoDaysLater = addDays(today, 2);
            const todayStr = today.toISOString().split('T')[0];
            const twoDaysLaterStr = twoDaysLater.toISOString().split('T')[0];
            
            const upcomingSessions = await db
                .select({
                    id: classSessions.id,
                    date: classSessions.date,
                    className: classes.name,
                })
                .from(classSessions)
                .innerJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
                .innerJoin(classes, eq(classSchedules.classId, classes.id))
                .innerJoin(scheduleTeachers, eq(classSchedules.id, scheduleTeachers.scheduleId))
                .where(
                    and(
                        eq(scheduleTeachers.teacherId, userDbId),
                        eq(classSessions.status, "scheduled"),
                        gte(classSessions.date, todayStr),
                        lte(classSessions.date, twoDaysLaterStr)
                    )
                )
                .limit(5);

            for (const session of upcomingSessions) {
                const sessionDate = new Date(session.date);
                const daysUntil = Math.ceil((sessionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const dayText = daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`;
                
                activities.push({
                    id: `reminder-${session.id}`,
                    type: "reminder",
                    title: "Session Reminder",
                    description: `${session.className || "Class"} - ${dayText} (${session.date})`,
                    timestamp: subDays(new Date(), 1), // Show as recent
                    isRead: true,
                });
            }

        }

        // ADMIN / ADMINISTRATIVE_EMPLOYEE: See all notifications
        if (userRole === UserRole.ADMIN || userRole === UserRole.ADMINISTRATIVE_EMPLOYEE) {
            
            // 1. Recent students (from students table which has firstName/lastName)
            const recentStudents = await db
                .select({
                    id: students.id,
                    firstName: students.firstName,
                    lastName: students.lastName,
                    createdAt: students.createdAt,
                })
                .from(students)
                .orderBy(desc(students.createdAt))
                .limit(10);

            for (const student of recentStudents) {
                activities.push({
                    id: `student-${student.id}`,
                    type: "student",
                    title: "New Student",
                    description: `${student.firstName} ${student.lastName} joined Fortuna Center`,
                    timestamp: student.createdAt,
                    isRead: true,
                });
            }

            // 2. Recent published posts
            const recentPosts = await db.query.posts.findMany({
                where: eq(posts.status, "published"),
                orderBy: (table, { desc }) => [desc(posts.createdAt)],
                limit: 10,
            });

            for (const post of recentPosts) {
                activities.push({
                    id: `post-${post.id}`,
                    type: "post",
                    title: "New App Post",
                    description: `"${post.title}" was published.`,
                    timestamp: post.createdAt,
                    isRead: true,
                });
            }

            // 3. Recent course payments
            const recentPayments = await db.query.coursePayments.findMany({
                with: {
                    student: { columns: { firstName: true, lastName: true } },
                    class: { columns: { name: true } },
                },
                orderBy: (table, { desc }) => [desc(table.createdAt)],
                limit: 10,
            });

            for (const payment of recentPayments) {
                activities.push({
                    id: `payment-${payment.id}`,
                    type: "payment",
                    title: "New Payment",
                    description: `Payment recorded for ${payment.student?.firstName || "Unknown"} in ${payment.class?.name || "a class"}`,
                    timestamp: payment.createdAt,
                    isRead: true,
                });
            }
        }

        // If somehow we reach here with no role match, return empty
        if (userRole !== UserRole.ADMIN && userRole !== UserRole.ADMINISTRATIVE_EMPLOYEE) {
            return NextResponse.json({
                success: true,
                data: [],
            });
        }

        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Limit the activity stream
        const latestActivities = activities.slice(0, 20);

        return NextResponse.json({
            success: true,
            data: latestActivities,
        });

    } catch (error) {
        console.error("[NOTIFICATIONS_GET]", error);
        return NextResponse.json(
            { success: false, message: "Failed to load notifications stream." },
            { status: 500 }
        );
    }
}
