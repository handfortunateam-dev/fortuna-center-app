import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { EDUCATION_LEVELS, OCCUPATION_TYPES } from "@/features/lms/students/constants";

export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students Template");

    // Define columns
    // Define columns
    worksheet.columns = [
      { header: "Registration Date", key: "registrationDate", width: 18 },
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
      { header: "Occupation", key: "occupation", width: 25 },
      // { header: "Password", key: "password", width: 20 },
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
      registrationDate: "2026-02-17",
      firstName: "John",
      middleName: "Michael",
      lastName: "Doe",
      gender: "male",
      placeOfBirth: "Jakarta",
      dateOfBirth: "1971-04-17",
      email: "john.doe@example.com",
      phone: "+62812345678",
      address: "Jl. Contoh No. 123, Jakarta",
      education: "Senior High School",
      occupation: "Student (School)",
      // password: "Password123!",
    });

    worksheet.addRow({
      registrationDate: "2026-02-17",
      firstName: "Jane",
      middleName: "",
      lastName: "Smith",
      gender: "female",
      placeOfBirth: "Bandung",
      dateOfBirth: "2001-05-20",
      email: "jane.smith@example.com",
      phone: "+62823456789",
      address: "Jl. Sample No. 456, Bandung",
      education: "Diploma 3",
      occupation: "Student (University)",
      // password: "SecurePass456!",
    });

    // Add data validations for Education (column K) and Occupation (column L) up to row 1000
    const educationList = `"${EDUCATION_LEVELS.map((e) => e.value).join(",")}"`;
    const occupationList = `"${OCCUPATION_TYPES.map((o) => o.value).join(",")}"`;

    for (let i = 2; i <= 1000; i++) {
      worksheet.getCell(`K${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [educationList],
        showErrorMessage: true,
        errorTitle: "Invalid Education",
        error: "Please select a valid education level from the dropdown list.",
      };

      worksheet.getCell(`L${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [occupationList],
        showErrorMessage: true,
        errorTitle: "Invalid Occupation",
        error: "Please select a valid occupation from the dropdown list.",
      };
    }

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
      "⚠️ Hapus baris contoh di atas. Registration Date akan auto-generate jika kosong. Gender: male/female. Date format: YYYY-MM-DD (contoh: 1971-04-17). Password hanya diperlukan jika centang 'Buat akun user juga'. Gunakan dropdown untuk Education dan Occupation.",
    ]);
    instructionRow.getCell(1).font = { italic: true, color: { argb: "FF6B7280" } };
    worksheet.mergeCells(`A${instructionRow.number}:M${instructionRow.number}`);

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="students-import-template.xlsx"`,
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
