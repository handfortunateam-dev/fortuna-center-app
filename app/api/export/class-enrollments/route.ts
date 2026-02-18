import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { classEnrollments } from "@/db/schema";
import { users, classes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ExcelJS from "exceljs";

export async function GET(request: NextRequest) {
    try {
        const data = await db
            .select({
                studentName: users.name,
                studentEmail: users.email,
                className: classes.name,
                classCode: classes.code,
                enrolledAt: classEnrollments.enrolledAt,
            })
            .from(classEnrollments)
            .leftJoin(users, eq(classEnrollments.studentId, users.id))
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

        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } }; // White text
        headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4F46E5" }, // Indigo-600 background
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

        // Add borders and styling to all cells
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
                // Stripe effect for rows
                if (rowNumber % 2 === 0 && rowNumber > 1) {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF9FAFB' } // Gray-50
                    };
                }
                if (rowNumber > 1) {
                    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                }
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="enrollments-export-${new Date().toISOString().split("T")[0]
                    }.xlsx"`,
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
