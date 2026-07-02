import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { classes, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Fetch teachers and classes from DB
    const [teacherList, classList] = await Promise.all([
      db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.role, "TEACHER")),
      db
        .select({ id: classes.id, name: classes.name, code: classes.code })
        .from(classes)
        .where(eq(classes.isActive, true)),
    ]);

    const workbook = new ExcelJS.Workbook();

    // === Main Sheet ===
    const worksheet = workbook.addWorksheet("Teacher Classes");

    worksheet.columns = [
      { header: "Teacher", key: "teacher", width: 45 },
      { header: "Class", key: "class", width: 45 },
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

    // === Reference Sheet for dropdown data ===
    const refSheet = workbook.addWorksheet("Data");

    // Teacher list header
    refSheet.getCell("A1").value = "Teachers";
    refSheet.getCell("A1").font = { bold: true };
    refSheet.getColumn("A").width = 55;

    // Class list header
    refSheet.getCell("B1").value = "Classes";
    refSheet.getCell("B1").font = { bold: true };
    refSheet.getColumn("B").width = 55;

    // Populate teacher data: "Name - email (UUID)"
    teacherList.forEach((t, i) => {
      refSheet.getCell(`A${i + 2}`).value = `${t.name} - ${t.email} (${t.id})`;
    });

    // Populate class data: "Name - Code (UUID)"
    classList.forEach((c, i) => {
      refSheet.getCell(`B${i + 2}`).value = `${c.name} - ${c.code} (${c.id})`;
    });

    // Define named ranges for data validation
    const teacherEndRow = teacherList.length + 1;
    const classEndRow = classList.length + 1;

    // Add data validation (dropdown) to main sheet rows 2-100
    for (let row = 2; row <= 100; row++) {
      // Teacher dropdown
      worksheet.getCell(`A${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`Data!$A$2:$A$${teacherEndRow}`],
        showErrorMessage: true,
        errorTitle: "Invalid Teacher",
        error: "Please select a teacher from the dropdown list.",
      };

      // Class dropdown
      worksheet.getCell(`B${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`Data!$B$2:$B$${classEndRow}`],
        showErrorMessage: true,
        errorTitle: "Invalid Class",
        error: "Please select a class from the dropdown list.",
      };
    }

    // Add instruction row
    const instructionRow = worksheet.addRow([
      "⚠️ Pilih Teacher dan Class dari dropdown. Data referensi ada di sheet 'Data'.",
    ]);
    instructionRow.getCell(1).font = {
      italic: true,
      color: { argb: "FF6B7280" },
    };
    worksheet.mergeCells(
      `A${instructionRow.number}:B${instructionRow.number}`,
    );

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="teacher-classes-import-template.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate template" },
      { status: 500 },
    );
  }
}
