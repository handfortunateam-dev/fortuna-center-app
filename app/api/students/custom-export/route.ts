import { NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema/students.schema";
import { desc, and, gte, lt, SQL } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get("limit");
        const yearParam = searchParams.get("year");

        const conditions: SQL<unknown>[] = [];

        if (yearParam && yearParam !== "all") {
            const year = parseInt(yearParam);
            if (!isNaN(year)) {
                // Find everything in that year
                const startDate = `${year}-01-01`;
                const endDate = `${year + 1}-01-01`;
                conditions.push(gte(students.registrationDate, startDate));
                conditions.push(lt(students.registrationDate, endDate));
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let query: any = db.select().from(students);

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        query = query.orderBy(desc(students.createdAt));

        if (limitParam && limitParam !== "all") {
            const limit = parseInt(limitParam);
            if (!isNaN(limit)) {
                query = query.limit(limit);
            }
        }

        const data = await query;

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Custom export error:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
