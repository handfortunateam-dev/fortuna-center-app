import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Classes Template");

    worksheet.columns = [
      { header: "Class Code", key: "code", width: 15 },
      { header: "Class Name", key: "name", width: 30 },
      { header: "Description", key: "description", width: 50 },
      { header: "Active", key: "isActive", width: 10 },
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
      code: "MATH101",
      name: "Matematika Kelas 10A",
      description: "Kelas matematika untuk siswa kelas 10",
      isActive: "TRUE",
    });

    worksheet.addRow({
      code: "ENG201",
      name: "Bahasa Inggris Kelas 11B",
      description: "Kelas bahasa Inggris tingkat lanjut",
      isActive: "TRUE",
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
      "⚠️ Hapus baris contoh di atas dan tambahkan data Anda sendiri",
    ]);
    instructionRow.getCell(1).font = { italic: true, color: { argb: "FF6B7280" } };
    worksheet.mergeCells(`A${instructionRow.number}:D${instructionRow.number}`);

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="classes-import-template.xlsx"`,
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
