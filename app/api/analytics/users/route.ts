import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { students } from "@/db/schema/students.schema";
import { teachers } from "@/db/schema/teachers.schema";
import { sql, isNotNull } from "drizzle-orm";

export async function GET() {
    try {
        // 1. Get total counts
        const [{ usersCount }] = await db.select({ usersCount: sql<number>`count(*)` }).from(users);
        const [{ studentsCount }] = await db.select({ studentsCount: sql<number>`count(*)` }).from(students);
        const [{ activeStudentsCount }] = await db.select({ activeStudentsCount: sql<number>`count(*)` }).from(students).where(sql`${students.status} = 'active'`);
        const [{ teachersCount }] = await db.select({ teachersCount: sql<number>`count(*)` }).from(teachers);

        // 2. Get users grouped by role
        const rolesData = await db
            .select({
                role: users.role,
                value: sql<number>`count(*)`
            })
            .from(users)
            .groupBy(users.role);

        // 3. Student registrations over time from registrationDate (monthly)
        const registrationsData = await db
            .select({
                month: sql<string>`to_char(${students.registrationDate}, 'YYYY-MM')`,
                count: sql<number>`count(*)`
            })
            .from(students)
            .where(isNotNull(students.registrationDate))
            .groupBy(sql`to_char(${students.registrationDate}, 'YYYY-MM')`)
            .orderBy(sql`to_char(${students.registrationDate}, 'YYYY-MM')`);

        // Yearly registrations
        const registrationsByYearData = await db
            .select({
                year: sql<string>`to_char(${students.registrationDate}, 'YYYY')`,
                count: sql<number>`count(*)`
            })
            .from(students)
            .where(isNotNull(students.registrationDate))
            .groupBy(sql`to_char(${students.registrationDate}, 'YYYY')`)
            .orderBy(sql`to_char(${students.registrationDate}, 'YYYY')`);

        // Quarterly registrations
        const registrationsByQuarterData = await db
            .select({
                quarter: sql<string>`to_char(${students.registrationDate}, 'YYYY') || '-Q' || to_char(${students.registrationDate}, 'Q')`,
                count: sql<number>`count(*)`
            })
            .from(students)
            .where(isNotNull(students.registrationDate))
            .groupBy(sql`to_char(${students.registrationDate}, 'YYYY') || '-Q' || to_char(${students.registrationDate}, 'Q')`)
            .orderBy(sql`to_char(${students.registrationDate}, 'YYYY') || '-Q' || to_char(${students.registrationDate}, 'Q')`);

        // Place of birth distribution (NULL + empty string → "Unknown/Missing")
        const studentPlaceOfBirthData = await db
            .select({
                name: sql<string>`COALESCE(NULLIF(TRIM(${students.placeOfBirth}), ''), 'Unknown/Missing')`,
                value: sql<number>`count(*)`
            })
            .from(students)
            .groupBy(sql`COALESCE(NULLIF(TRIM(${students.placeOfBirth}), ''), 'Unknown/Missing')`)
            .orderBy(sql`count(*) DESC`);

        // 4. Students analytics
        const studentGenderData = await db
            .select({
                name: students.gender,
                value: sql<number>`count(*)`
            })
            .from(students)
            .where(isNotNull(students.gender))
            .groupBy(students.gender);

        const studentEducationData = await db
            .select({
                name: sql<string>`COALESCE(${students.education}, 'Unknown/Missing')`,
                value: sql<number>`count(*)`
            })
            .from(students)
            .groupBy(sql`COALESCE(${students.education}, 'Unknown/Missing')`)
            .orderBy(sql`count(*) DESC`);

        const studentOccupationData = await db
            .select({
                name: sql<string>`COALESCE(${students.occupation}, 'Unknown/Missing')`,
                value: sql<number>`count(*)`
            })
            .from(students)
            .groupBy(sql`COALESCE(${students.occupation}, 'Unknown/Missing')`)
            .orderBy(sql`count(*) DESC`);

        const studentStatusData = await db
            .select({
                name: students.status,
                value: sql<number>`count(*)`
            })
            .from(students)
            .groupBy(students.status);

        // Calculate average age from dateOfBirth
        const [{ studentAvgAge }] = await db
            .select({
                studentAvgAge: sql<number>`AVG(EXTRACT(YEAR FROM age(current_date, ${students.dateOfBirth})))`
            })
            .from(students)
            .where(isNotNull(students.dateOfBirth));

        // Calculate age distribution for students
        const studentAgeData = await db
            .select({
                name: sql<string>`
                    CASE 
                        WHEN ${students.dateOfBirth} IS NULL THEN 'Unknown/Missing'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${students.dateOfBirth})) < 18 THEN '< 18'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${students.dateOfBirth})) BETWEEN 18 AND 24 THEN '18-24'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${students.dateOfBirth})) BETWEEN 25 AND 34 THEN '25-34'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${students.dateOfBirth})) BETWEEN 35 AND 44 THEN '35-44'
                        ELSE '45+'
                    END
                `,
                value: sql<number>`count(*)`
            })
            .from(students)
            .groupBy(sql`
                    CASE 
                        WHEN ${students.dateOfBirth} IS NULL THEN 'Unknown/Missing'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${students.dateOfBirth})) < 18 THEN '< 18'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${students.dateOfBirth})) BETWEEN 18 AND 24 THEN '18-24'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${students.dateOfBirth})) BETWEEN 25 AND 34 THEN '25-34'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${students.dateOfBirth})) BETWEEN 35 AND 44 THEN '35-44'
                        ELSE '45+'
                    END
            `);

        // 5. Teachers analytics
        const teacherGenderData = await db
            .select({
                name: teachers.gender,
                value: sql<number>`count(*)`
            })
            .from(teachers)
            .where(isNotNull(teachers.gender))
            .groupBy(teachers.gender);

        const teacherEducationData = await db
            .select({
                name: teachers.education,
                value: sql<number>`count(*)`
            })
            .from(teachers)
            .where(isNotNull(teachers.education))
            .groupBy(teachers.education);

        const [{ teacherAvgAge }] = await db
            .select({
                teacherAvgAge: sql<number>`AVG(EXTRACT(YEAR FROM age(current_date, ${teachers.dateOfBirth})))`
            })
            .from(teachers)
            .where(isNotNull(teachers.dateOfBirth));

        // Calculate age distribution for teachers
        const teacherAgeData = await db
            .select({
                name: sql<string>`
                    CASE 
                        WHEN EXTRACT(YEAR FROM age(current_date, ${teachers.dateOfBirth})) < 25 THEN '< 25'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${teachers.dateOfBirth})) BETWEEN 25 AND 34 THEN '25-34'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${teachers.dateOfBirth})) BETWEEN 35 AND 44 THEN '35-44'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${teachers.dateOfBirth})) BETWEEN 45 AND 54 THEN '45-54'
                        ELSE '55+'
                    END
                `,
                value: sql<number>`count(*)`
            })
            .from(teachers)
            .where(isNotNull(teachers.dateOfBirth))
            .groupBy(sql`
                    CASE 
                        WHEN EXTRACT(YEAR FROM age(current_date, ${teachers.dateOfBirth})) < 25 THEN '< 25'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${teachers.dateOfBirth})) BETWEEN 25 AND 34 THEN '25-34'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${teachers.dateOfBirth})) BETWEEN 35 AND 44 THEN '35-44'
                        WHEN EXTRACT(YEAR FROM age(current_date, ${teachers.dateOfBirth})) BETWEEN 45 AND 54 THEN '45-54'
                        ELSE '55+'
                    END
            `);

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalUsers: Number(usersCount),
                    totalStudents: Number(studentsCount),
                    activeStudents: Number(activeStudentsCount),
                    totalTeachers: Number(teachersCount),
                },
                usersByRole: rolesData.map(r => ({ ...r, value: Number(r.value) })),
                registrations: registrationsData.map(r => ({ name: r.month, users: Number(r.count) })),
                registrationsByYear: registrationsByYearData.map(r => ({ name: r.year, users: Number(r.count) })),
                registrationsByQuarter: registrationsByQuarterData.map(r => ({ name: r.quarter, users: Number(r.count) })),
                students: {
                    gender: studentGenderData.map(r => ({ ...r, value: Number(r.value) })),
                    education: studentEducationData.map(r => ({ ...r, value: Number(r.value) })),
                    occupation: studentOccupationData.map(r => ({ ...r, value: Number(r.value) })),
                    status: studentStatusData.map(r => ({ ...r, value: Number(r.value) })),
                    ages: studentAgeData.map(r => ({ ...r, value: Number(r.value) })),
                    placeOfBirth: studentPlaceOfBirthData.map(r => ({ ...r, value: Number(r.value) })),
                    avgAge: Math.round(Number(studentAvgAge) || 0)
                },
                teachers: {
                    gender: teacherGenderData.map(r => ({ ...r, value: Number(r.value) })),
                    education: teacherEducationData.map(r => ({ ...r, value: Number(r.value) })),
                    ages: teacherAgeData.map(r => ({ ...r, value: Number(r.value) })),
                    avgAge: Math.round(Number(teacherAvgAge) || 0)
                }
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
