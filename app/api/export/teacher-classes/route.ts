import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teacherClasses, users, classes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ExcelJS from "exceljs";

export async function GET(request: NextRequest) {
    try {
        const data = await db
            .select({
                teacherName: users.name,
                teacherEmail: users.email,
                className: classes.name,
                classCode: classes.code,
                assignedAt: teacherClasses.assignedAt,
            })
            .from(teacherClasses)
            .leftJoin(users, eq(teacherClasses.teacherId, users.id))
            .leftJoin(classes, eq(teacherClasses.classId, classes.id))
            .orderBy(desc(teacherClasses.assignedAt));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Teacher Classes");

        worksheet.columns = [
            { header: "Teacher Name", key: "teacherName", width: 30 },
            { header: "Teacher Email", key: "teacherEmail", width: 35 },
            { header: "Class Name", key: "className", width: 30 },
            { header: "Class Code", key: "classCode", width: 15 },
            { header: "Assigned At", key: "assignedAt", width: 25 },
        ];

        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } }; // White
        headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4F46E5" }, // Indigo-600
        };
        headerRow.alignment = { vertical: "middle", horizontal: "center" };
        headerRow.height = 30;

        data.forEach((row) => {
            worksheet.addRow({
                teacherName: row.teacherName || "Unknown Teacher",
                teacherEmail: row.teacherEmail || "",
                className: row.className || "Unknown Class",
                classCode: row.classCode || "",
                assignedAt: row.assignedAt ? new Date(row.assignedAt).toLocaleDateString() : "",
            });
        });

        // Add borders to all cells
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
                // Stripe effect
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
                "Content-Disposition": `attachment; filename="teacher-classes-export-${new Date().toISOString().split("T")[0]
                    }.xlsx"`,
            },
        });
    } catch (error) {
        console.error("Error exporting teacher classes:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to export teacher classes",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
