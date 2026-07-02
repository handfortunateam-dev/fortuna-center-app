import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { classEnrollments, classes, students } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import ExcelJS from "exceljs";

export async function GET(request: NextRequest) {
    try {
        const data = await db
            .select({
                studentName: sql<string>`concat_ws(' ', ${students.firstName}, ${students.middleName}, ${students.lastName})`,
                studentEmail: students.email,
                className: classes.name,
                classCode: classes.code,
                enrolledAt: classEnrollments.enrolledAt,
            })
            .from(classEnrollments)
            .leftJoin(students, eq(classEnrollments.studentId, students.id))
            .leftJoin(classes, eq(classEnrollments.classId, classes.id))
            .orderBy(desc(classEnrollments.enrolledAt));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Class Enrollments");

        worksheet.columns = [
            { header: "Student Name", key: "studentName", width: 30 },
            { header: "Student Email", key: "studentEmail", width: 35 },
            { header: "Class Name", key: "className", width: 30 },
            { header: "Class Code", key: "classCode", width: 15 },
            { header: "Enrolled At", key: "enrolledAt", width: 25 },
        ];

        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
        headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4F46E5" },
        };
        headerRow.alignment = { vertical: "middle", horizontal: "center" };
        headerRow.height = 30;

        data.forEach((row) => {
            worksheet.addRow({
                studentName: row.studentName || "Unknown Student",
                studentEmail: row.studentEmail || "",
                className: row.className || "Unknown Class",
                classCode: row.classCode || "",
                enrolledAt: row.enrolledAt
                    ? new Date(row.enrolledAt).toLocaleDateString()
                    : "",
            });
        });

        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
                if (rowNumber % 2 === 0 && rowNumber > 1) {
                    row.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFF9FAFB" },
                    };
                }
                if (rowNumber > 1) {
                    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
                }
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="enrollments-export-${new Date().toISOString().split("T")[0]}.xlsx"`,
            },
        });
    } catch (error) {
        console.error("Error exporting enrollments:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to export enrollments",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
