import { NextResponse } from "next/server";
import { db } from "@/db";
import { coursePayments } from "@/db/schema/course-payment.schema";
import { classes } from "@/db/schema/class.schema";
import { sql, isNotNull, eq, and } from "drizzle-orm";

export async function GET() {
    try {
        // Today's date to get the current month/year
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        // 1. Get total revenue for the current month
        const [{ currentMonthRevenue }] = await db
            .select({
                currentMonthRevenue: sql<number>`SUM(CASE WHEN ${coursePayments.status} = 'paid' THEN ${coursePayments.amount} ELSE 0 END)`
            })
            .from(coursePayments)
            .where(
                and(
                    eq(coursePayments.month, currentMonth),
                    eq(coursePayments.year, currentYear)
                )
            );

        // 2. Get total outstanding (unpaid) for the current month
        const [{ currentMonthUnpaid }] = await db
            .select({
                currentMonthUnpaid: sql<number>`SUM(CASE WHEN ${coursePayments.status} = 'unpaid' THEN ${coursePayments.amount} ELSE 0 END)`
            })
            .from(coursePayments)
            .where(
                and(
                    eq(coursePayments.month, currentMonth),
                    eq(coursePayments.year, currentYear)
                )
            );

        // 3. Get total revenue overall
        const [{ totalRevenue }] = await db
            .select({
                totalRevenue: sql<number>`SUM(${coursePayments.amount})`
            })
            .from(coursePayments)
            .where(eq(coursePayments.status, "paid"));

        // 4. Revenue by class (Top 10 classes)
        const revenueByClassQuery = await db
            .select({
                className: classes.name,
                revenue: sql<number>`SUM(${coursePayments.amount})`
            })
            .from(coursePayments)
            .innerJoin(classes, eq(coursePayments.classId, classes.id))
            .where(eq(coursePayments.status, "paid"))
            .groupBy(classes.name)
            .orderBy(sql`SUM(${coursePayments.amount}) DESC`)
            .limit(10);

        // 5. Monthly Revenue Trend (Last 6 Months)
        const monthlyTrendQuery = await db
            .select({
                month: coursePayments.month,
                year: coursePayments.year,
                revenue: sql<number>`SUM(${coursePayments.amount})`
            })
            .from(coursePayments)
            .where(eq(coursePayments.status, "paid"))
            .groupBy(coursePayments.month, coursePayments.year)
            .orderBy(coursePayments.year, coursePayments.month);

        // Format trend data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyTrend = monthlyTrendQuery.map(row => ({
            period: `${monthNames[Number(row.month) - 1]} ${row.year}`,
            revenue: Number(row.revenue) || 0
        })).slice(-6); // Keep last 6 months

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    currentMonthRevenue: Number(currentMonthRevenue) || 0,
                    currentMonthUnpaid: Number(currentMonthUnpaid) || 0,
                    totalRevenue: Number(totalRevenue) || 0,
                },
                revenueByClass: revenueByClassQuery.map(r => ({ name: r.className, value: Number(r.revenue) || 0 })),
                monthlyTrend
            }
        });
    } catch (error) {
        console.error("Error fetching financial overview:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch financial data" },
            { status: 500 }
        );
    }
}
