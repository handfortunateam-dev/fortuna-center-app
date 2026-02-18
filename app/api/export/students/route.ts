import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { desc } from "drizzle-orm";
import ExcelJS from "exceljs";

export async function GET(request: NextRequest) {
    try {
        const data = await db
            .select({
                firstName: students.firstName,
                middleName: students.middleName,
                lastName: students.lastName,
                email: students.email,
                phone: students.phone,
                address: students.address,
                createdAt: students.createdAt,
            })
            .from(students)
            .orderBy(desc(students.createdAt));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Students");

        worksheet.columns = [
            { header: "First Name", key: "firstName", width: 20 },
            { header: "Middle Name", key: "middleName", width: 20 },
            { header: "Last Name", key: "lastName", width: 20 },
            { header: "Email", key: "email", width: 35 },
            { header: "Phone", key: "phone", width: 20 },
            { header: "Address", key: "address", width: 40 },
            { header: "Created At", key: "createdAt", width: 25 },
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
                firstName: row.firstName,
                middleName: row.middleName || "",
                lastName: row.lastName,
                email: row.email,
                phone: row.phone || "",
                address: row.address || "",
                createdAt: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "",
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
                "Content-Disposition": `attachment; filename="students-export-${new Date().toISOString().split("T")[0]
                    }.xlsx"`,
            },
        });
    } catch (error) {
        console.error("Error exporting students:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to export students",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
