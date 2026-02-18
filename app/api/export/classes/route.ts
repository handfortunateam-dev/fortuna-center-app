import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { desc } from "drizzle-orm";
import ExcelJS from "exceljs";

export async function GET(request: NextRequest) {
    try {
        const data = await db
            .select({
                name: classes.name,
                code: classes.code,
                description: classes.description,
                isActive: classes.isActive,
                createdAt: classes.createdAt,
            })
            .from(classes)
            .orderBy(desc(classes.createdAt));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Classes");

        worksheet.columns = [
            { header: "Name", key: "name", width: 30 },
            { header: "Code", key: "code", width: 15 },
            { header: "Description", key: "description", width: 40 },
            { header: "Is Active", key: "isActive", width: 15 },
            { header: "Created At", key: "createdAt", width: 25 },
        ];

        // Style the header
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
                name: row.name,
                code: row.code,
                description: row.description || "",
                isActive: row.isActive ? "Yes" : "No",
                createdAt: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "",
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
                "Content-Disposition": `attachment; filename="classes-export-${new Date().toISOString().split("T")[0]
                    }.xlsx"`,
            },
        });
    } catch (error) {
        console.error("Error exporting classes:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to export classes",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
