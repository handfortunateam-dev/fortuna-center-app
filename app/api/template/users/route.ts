import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users Template");

    worksheet.columns = [
      { header: "Email", key: "email", width: 35 },
      { header: "Password", key: "password", width: 20 },
      { header: "First Name", key: "firstName", width: 20 },
      { header: "Last Name", key: "lastName", width: 20 },
      { header: "Role", key: "role", width: 15 },
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

    worksheet.addRow({
      email: "admin@example.com",
      password: "SecurePass123!",
      firstName: "Admin",
      lastName: "System",
      role: "ADMIN",
    });

    worksheet.addRow({
      email: "teacher@example.com",
      password: "TeacherPass456!",
      firstName: "Teacher",
      lastName: "Demo",
      role: "TEACHER",
    });

    worksheet.addRow({
      email: "student@example.com",
      password: "StudentPass789!",
      firstName: "Student",
      lastName: "Test",
      role: "STUDENT",
    });

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        if (rowNumber > 1) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
          cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        }
      });
    });

    const instructionRow = worksheet.addRow([
      "⚠️ Hapus baris contoh di atas. Role options: ADMIN | TEACHER | STUDENT | ADMINISTRATIVE_EMPLOYEE (case insensitive)",
    ]);
    instructionRow.getCell(1).font = { italic: true, color: { argb: "FF6B7280" } };
    worksheet.mergeCells(`A${instructionRow.number}:E${instructionRow.number}`);

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="users-import-template.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate template" },
      { status: 500 }
    );
  }
}
