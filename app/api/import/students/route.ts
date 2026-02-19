import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, message: "No data provided" },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      failedRows: [] as object[],
    };

    for (const row of data) {
      try {
        // Flexible mapping to support various header formats
        const studentId = row.studentId || row["Student ID"] || row["Nomor Induk"] || row.studentid;
        const registrationDate = row.registrationDate || row["Registration Date"] || row["Tanggal Registrasi"] || row.registrationdate;
        const firstName = row.firstName || row["First Name"] || row["Nama Depan"] || row.firstname;
        const middleName = row.middleName || row["Middle Name"] || row["Nama Tengah"] || row.middlename || null;
        const lastName = row.lastName || row["Last Name"] || row["Nama Belakang"] || row.lastname;
        const gender = row.gender || row["Gender"] || row["Jenis Kelamin"] || row.GENDER || null;
        const placeOfBirth = row.placeOfBirth || row["Place of Birth"] || row["Tempat Lahir"] || row.placeofbirth || null;
        const dateOfBirth = row.dateOfBirth || row["Date of Birth"] || row["Tanggal Lahir"] || row.dateofbirth || null;
        const email = row.email || row["Email"] || row.EMAIL;
        const phone = row.phone || row["Phone"] || row["No HP"] || row.PHONE || null;
        const address = row.address || row["Address"] || row["Alamat"] || row.ADDRESS || null;
        const education = row.education || row["Education"] || row["Pendidikan"] || row.EDUCATION || null;
        const occupation = row.occupation || row["Occupation"] || row["Pekerjaan"] || row.OCCUPATION || null;

        // Skip if no essential data
        if (!firstName || !lastName || !email) {
          results.errors.push(`Row skipped: Missing required fields (firstName, lastName, email)`);
          results.failed++;
          results.failedRows.push(row);
          continue;
        }

        // Skip example/template data
        if (email.includes("example.com") || email.includes("@example")) {
          continue;
        }

        // Generate studentId if not provided
        const finalStudentId = studentId || `STD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        // Check if studentId already exists
        const existingStudentId = await db
          .select()
          .from(students)
          .where(eq(students.studentId, finalStudentId))
          .limit(1);

        if (existingStudentId.length > 0) {
          results.errors.push(`Student ID ${finalStudentId} already exists`);
          results.failed++;
          results.failedRows.push(row);
          continue;
        }

        // Check if student already exists by email
        const existingStudent = await db
          .select()
          .from(students)
          .where(eq(students.email, email))
          .limit(1);

        if (existingStudent.length > 0) {
          results.errors.push(`Student with email ${email} already exists`);
          results.failed++;
          results.failedRows.push(row);
          continue;
        }

        // Normalize gender value
        const normalizedGender = gender
          ? gender.toLowerCase() === "male" || gender.toLowerCase() === "laki-laki" || gender.toLowerCase() === "l"
            ? "male"
            : gender.toLowerCase() === "female" || gender.toLowerCase() === "perempuan" || gender.toLowerCase() === "p"
            ? "female"
            : null
          : null;

        // Save to students table only
        await db.insert(students).values({
          studentId: finalStudentId,
          registrationDate: registrationDate || new Date().toISOString().split("T")[0],
          firstName,
          middleName,
          lastName,
          gender: normalizedGender,
          placeOfBirth,
          dateOfBirth,
          email,
          phone,
          address,
          education,
          occupation,
          userId: null,
        });

        results.success++;
      } catch (rowError) {
        console.error("Error processing row:", rowError);
        results.failed++;
        results.errors.push(
          `Row error: ${rowError instanceof Error ? rowError.message : "Unknown error"}`
        );
        results.failedRows.push(row);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.success} students added, ${results.failed} failed`,
      details: results,
    });
  } catch (error) {
    console.error("Error importing students:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to import students",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
