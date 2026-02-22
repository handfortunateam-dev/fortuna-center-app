"use server";

import { db } from "@/db";
import { count, eq, desc, gt, and } from "drizzle-orm";
import { students } from "@/db/schema/students.schema";
import { classes } from "@/db/schema/class.schema";
import { coursePayments } from "@/db/schema/course-payment.schema";
import { posts } from "@/db/schema/posts.schema";
import { getAuthUser } from "@/lib/auth/getAuthUser";

export async function getAdministrativeDashboardStats() {
    try {
        const user = await getAuthUser();
        if (!user || (user.role !== "ADMINISTRATIVE_EMPLOYEE" && user.role !== "ADMIN" && !user.isAdminEmployeeAlso)) {
            throw new Error("Unauthorized access to administrative dashboard");
        }

        // Get total students
        const [studentsCount] = await db
            .select({ value: count() })
            .from(students);

        // Get total active classes
        const [classesCount] = await db
            .select({ value: count() })
            .from(classes)
            .where(eq(classes.isActive, true));

        // Get total pending payments
        const [pendingPaymentsCount] = await db
            .select({ value: count() })
            .from(coursePayments)
            .where(eq(coursePayments.status, "unpaid"));

        // Get total published articles
        const [publishedArticlesCount] = await db
            .select({ value: count() })
            .from(posts)
            .where(eq(posts.status, "published"));

        return {
            students: studentsCount.value || 0,
            classes: classesCount.value || 0,
            pendingPayments: pendingPaymentsCount.value || 0,
            publishedArticles: publishedArticlesCount.value || 0,
        };
    } catch (error) {
        console.error("Error fetching administrative stats:", error);
        return {
            students: 0,
            classes: 0,
            pendingPayments: 0,
            publishedArticles: 0,
        };
    }
}

export interface RecentActivity {
    time: string;
    text: string;
    date: Date;
    icon: string;
    color: string;
    type: "student" | "payment" | "post" | "class";
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
    try {
        const user = await getAuthUser();
        if (!user || (user.role !== "ADMINISTRATIVE_EMPLOYEE" && user.role !== "ADMIN" && !user.isAdminEmployeeAlso)) {
            throw new Error("Unauthorized access to administrative dashboard");
        }

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        // 1. Latest Students
        const latestStudents = await db
            .select({
                id: students.id,
                firstName: students.firstName,
                lastName: students.lastName,
                createdAt: students.createdAt,
            })
            .from(students)
            .where(gt(students.createdAt, twoWeeksAgo))
            .orderBy(desc(students.createdAt))
            .limit(20);

        // 2. Latest Payments (Paid)
        const latestPayments = await db
            .select({
                id: coursePayments.id,
                amount: coursePayments.amount,
                createdAt: coursePayments.createdAt,
                firstName: students.firstName,
                lastName: students.lastName,
            })
            .from(coursePayments)
            .leftJoin(students, eq(coursePayments.studentId, students.id))
            .where(and(gt(coursePayments.createdAt, twoWeeksAgo), eq(coursePayments.status, "paid")))
            .orderBy(desc(coursePayments.createdAt))
            .limit(20);

        // 3. Latest Published Articles
        const latestPosts = await db
            .select({
                id: posts.id,
                title: posts.title,
                createdAt: posts.createdAt,
            })
            .from(posts)
            .where(and(gt(posts.createdAt, twoWeeksAgo), eq(posts.status, "published")))
            .orderBy(desc(posts.createdAt))
            .limit(20);

        // 4. Latest Classes
        const latestClasses = await db
            .select({
                id: classes.id,
                name: classes.name,
                createdAt: classes.createdAt,
            })
            .from(classes)
            .where(gt(classes.createdAt, twoWeeksAgo))
            .orderBy(desc(classes.createdAt))
            .limit(20);

        // Transform and combine
        const activities: RecentActivity[] = [
            ...latestStudents.map(s => ({
                date: s.createdAt as Date,
                time: "",
                text: `New student ${s.firstName} ${s.lastName} enrolled.`,
                icon: "solar:user-plus-bold-duotone",
                color: "text-blue-500",
                type: "student" as const,
            })),
            ...latestPayments.map(p => ({
                date: p.createdAt as Date,
                time: "",
                text: `Payment of Rp ${p.amount.toLocaleString()} received from ${p.firstName || 'Student'}.`,
                icon: "solar:wallet-money-bold-duotone",
                color: "text-emerald-500",
                type: "payment" as const,
            })),
            ...latestPosts.map(p => ({
                date: p.createdAt as Date,
                time: "",
                text: `New article '${p.title}' published.`,
                icon: "solar:document-add-bold-duotone",
                color: "text-orange-500",
                type: "post" as const,
            })),
            ...latestClasses.map(c => ({
                date: c.createdAt as Date,
                time: "",
                text: `New class '${c.name}' created.`,
                icon: "solar:calendar-bold-duotone",
                color: "text-purple-500",
                type: "class" as const,
            })),
        ];

        // Sort by date descending
        return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
        console.error("Error fetching recent activity:", error);
        return [];
    }
}
