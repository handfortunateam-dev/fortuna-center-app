import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Teachers Template");

    // Define columns
    worksheet.columns = [
      { header: "First Name", key: "firstName", width: 20 },
      { header: "Middle Name", key: "middleName", width: 20 },
      { header: "Last Name", key: "lastName", width: 20 },
      { header: "Gender", key: "gender", width: 12 },
      { header: "Place of Birth", key: "placeOfBirth", width: 20 },
      { header: "Date of Birth", key: "dateOfBirth", width: 15 },
      { header: "Email", key: "email", width: 35 },
      { header: "Phone", key: "phone", width: 18 },
      { header: "Address", key: "address", width: 40 },
      { header: "Education", key: "education", width: 25 },
      { header: "Password", key: "password", width: 20 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" }, // Indigo-600
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 30;

    // Add example/dummy data (2 rows as examples)
    worksheet.addRow({
      firstName: "Ahmad",
      middleName: "Budi",
      lastName: "Santoso",
      gender: "male",
      placeOfBirth: "Jakarta",
      dateOfBirth: "1985-03-15",
      email: "ahmad.santoso@example.com",
      phone: "+62812345678",
      address: "Jl. Pendidikan No. 123, Jakarta",
      education: "Bachelor's Degree",
      password: "Password123!",
    });

    worksheet.addRow({
      firstName: "Siti",
      middleName: "",
      lastName: "Nurhaliza",
      gender: "female",
      placeOfBirth: "Bandung",
      dateOfBirth: "1990-07-20",
      email: "siti.nurhaliza@example.com",
      phone: "+62823456789",
      address: "Jl. Guru No. 456, Bandung",
      education: "Master's Degree",
      password: "SecurePass456!",
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

        // Light gray background for example rows
        if (rowNumber > 1) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" }, // Gray-50
          };
          cell.alignment = {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          };
        }
      });
    });

    // Add instruction note below the data
    const instructionRow = worksheet.addRow([
      "⚠️ Hapus baris contoh di atas. Gender: male/female. Date format: YYYY-MM-DD. Password diperlukan untuk membuat akun Clerk",
    ]);
    instructionRow.getCell(1).font = { italic: true, color: { argb: "FF6B7280" } };
    worksheet.mergeCells(`A${instructionRow.number}:K${instructionRow.number}`);

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="teachers-import-template.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate template",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
