import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";


export const maxDuration = 60; //seconds

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
        // Flexible field mapping (supports camelCase and various header formats)
        const studentId =
          row.studentId || row["Student ID"] || row["Nomor Induk"] || row.studentid;
        const registrationDate =
          row.registrationDate || row["Registration Date"] || row["Tanggal Registrasi"] || row.registrationdate;
        const firstName =
          row.firstName || row["First Name"] || row["Nama Depan"] || row.firstname;
        const middleName =
          row.middleName || row["Middle Name"] || row["Nama Tengah"] || row.middlename || null;
        const lastName =
          row.lastName || row["Last Name"] || row["Nama Belakang"] || row.lastname || "";
        const nickname =
          row.nickname || row["Nickname"] || row["Nama Panggilan"] || null;
        const gender =
          row.gender || row["Gender"] || row["Jenis Kelamin"] || row.GENDER || null;
        const placeOfBirth =
          row.placeOfBirth || row["Place of Birth"] || row["Tempat Lahir"] || row.placeofbirth || null;
        const dateOfBirth =
          row.dateOfBirth || row["Date of Birth"] || row["Tanggal Lahir"] || row.dateofbirth || null;
        const email =
          row.email || row["Email"] || row.EMAIL || null;
        const phone =
          row.phone || row["Phone"] || row["No HP"] || row["Phone Number"] || row["Nama Orang Tua"] || row["Nama Ortu"] || row.PHONE || null;
        const address =
          row.address || row["Address"] || row["Alamat"] || row.ADDRESS || null;
        const education =
          row.education || row["Education"] || row["Pendidikan"] || row.EDUCATION || "Unknown";
        const occupation =
          row.occupation || row["Occupation"] || row["Pekerjaan"] || row.OCCUPATION || "Unknown";

        // Required: firstName and phone (email is optional)
        if (!firstName || !phone) {
          results.errors.push(
            `Row skipped: Missing required fields (firstName, phone)`
          );
          results.failed++;
          results.failedRows.push(row);
          continue;
        }

        // Skip example/template rows
        if (email && (email.includes("example.com") || email.includes("@example"))) {
          continue;
        }

        // If studentId is manually provided, check for uniqueness
        if (studentId) {
          const existingStudentId = await db
            .select()
            .from(students)
            .where(eq(students.studentId, studentId))
            .limit(1);

          if (existingStudentId.length > 0) {
            results.errors.push(`Student ID ${studentId} already exists`);
            results.failed++;
            results.failedRows.push(row);
            continue;
          }
        }

        // Use a temp ID when none is provided; will be replaced after insert
        // with the proper format: ${year}${studentNumber.padStart(4, "0")}
        const tempId = studentId || `TEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // Check email uniqueness — only if email is provided
        if (email) {
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
        }

        // Normalize gender
        const normalizedGender =
          gender?.toLowerCase() === "male" ||
            gender?.toLowerCase() === "laki-laki" ||
            gender?.toLowerCase() === "l"
            ? "male"
            : gender?.toLowerCase() === "female" ||
              gender?.toLowerCase() === "perempuan" ||
              gender?.toLowerCase() === "p"
              ? "female"
              : null;

        const [inserted] = await db.insert(students).values({
          studentId: tempId,
          registrationDate:
            registrationDate || new Date().toISOString().split("T")[0],
          firstName,
          middleName,
          lastName,
          nickname: nickname || firstName,
          gender: normalizedGender,
          placeOfBirth,
          dateOfBirth,
          email,
          phone,
          address,
          education,
          occupation,
          userId: null,
        }).returning();

        // Replace temp ID with the proper format: ${year}${studentNumber padded to 4}
        if (!studentId) {
          const year = new Date().getFullYear();
          const sequence = String(inserted.studentNumber).padStart(4, "0");
          await db
            .update(students)
            .set({ studentId: `${year}${sequence}` })
            .where(eq(students.id, inserted.id));
        }

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
