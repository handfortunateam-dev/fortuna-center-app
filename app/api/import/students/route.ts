import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";

export const maxDuration = 60; //seconds

/**
 * Convert an Excel serial date number or date string → "YYYY-MM-DD".
 * Returns null when no valid date can be produced.
 */
function parseDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    if (value <= 0) return null;
    // Excel's serial date epoch: 1 Jan 1900 = 1, adjusted for the 1900 leap-year bug
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof value === "string") return value.trim() || null;
  return null;
}

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
        // Flexible field mapping (supports camelCase and various header formats).
        // Use ?? instead of || so falsy-but-valid values (e.g. 0, "") are not skipped.
        const studentId =
          row.studentId ?? row["Student ID"] ?? row["Nomor Induk"] ?? row.studentid ?? null;
        const firstName =
          row.firstName ?? row["First Name"] ?? row["Nama Depan"] ?? row.firstname ?? null;
        const middleName =
          row.middleName ?? row["Middle Name"] ?? row["Nama Tengah"] ?? row.middlename ?? null;
        const lastName =
          row.lastName ?? row["Last Name"] ?? row["Nama Belakang"] ?? row.lastname ?? "";
        const nickname =
          row.nickname ?? row["Nickname"] ?? row["Nama Panggilan"] ?? null;
        const gender =
          row.gender ?? row["Gender"] ?? row["Jenis Kelamin"] ?? row.GENDER ?? null;
        const placeOfBirth =
          row.placeOfBirth ?? row["Place of Birth"] ?? row["Tempat Lahir"] ?? row.placeofbirth ?? null;
        const email =
          row.email ?? row["Email"] ?? row.EMAIL ?? null;
        const address =
          row.address ?? row["Address"] ?? row["Alamat"] ?? row.ADDRESS ?? null;
        const education =
          row.education ?? row["Education"] ?? row["Pendidikan"] ?? row.EDUCATION ?? "Unknown";
        const occupation =
          row.occupation ?? row["Occupation"] ?? row["Pekerjaan"] ?? row.OCCUPATION ?? "Unknown";

        // date columns (schema: date type) — must produce "YYYY-MM-DD" strings.
        // parseDate handles both ISO strings and Excel serial numbers (e.g. 42058).
        const registrationDate =
          parseDate(row.registrationDate ?? row["Registration Date"] ?? row["Tanggal Registrasi"] ?? row.registrationdate)
          ?? new Date().toISOString().split("T")[0];
        const dateOfBirth =
          parseDate(row.dateOfBirth ?? row["Date of Birth"] ?? row["Tanggal Lahir"] ?? row.dateofbirth);

        // phone — schema: text NOT NULL. Use "" when not provided (null would violate NOT NULL).
        const phoneRaw =
          row.phone ?? row["Phone"] ?? row["No HP"] ?? row["Phone Number"] ?? row["Nama Orang Tua"] ?? row["Nama Ortu"] ?? row.PHONE ?? null;
        const phone =
          phoneRaw !== null && phoneRaw !== undefined && phoneRaw !== 0 && String(phoneRaw).trim() !== "" && String(phoneRaw).trim() !== "0"
            ? String(phoneRaw).trim()
            : ""; // empty string satisfies NOT NULL; null would not

        // Required: firstName (phone is optional — students may be children without one)
        if (!firstName) {
          results.errors.push(`Row skipped: Missing required field: firstName`);
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
            .where(eq(students.studentId, String(studentId)))
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
        const tempId = studentId ? String(studentId) : `TEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

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
          typeof gender === "string" && (gender.toLowerCase() === "male" || gender.toLowerCase() === "laki-laki" || gender.toLowerCase() === "l")
            ? "male"
            : typeof gender === "string" && (gender.toLowerCase() === "female" || gender.toLowerCase() === "perempuan" || gender.toLowerCase() === "p")
              ? "female"
              : null;

        const [inserted] = await db.insert(students).values({
          studentId: tempId,
          registrationDate,
          firstName: String(firstName),
          middleName: middleName ? String(middleName) : null,
          lastName: lastName ? String(lastName) : "",
          nickname: nickname ? String(nickname) : String(firstName),
          gender: normalizedGender,
          placeOfBirth: placeOfBirth ? String(placeOfBirth) : null,
          dateOfBirth,
          email: email ? String(email) : null,
          phone,
          address: address ? String(address) : null,
          education: String(education),
          occupation: String(occupation),
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
