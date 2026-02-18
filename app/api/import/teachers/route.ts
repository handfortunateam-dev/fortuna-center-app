import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, teachers } from "@/db/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;
    // For teachers, we default createUserAccounts to true since they need login access
    const createUserAccounts = true;

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
      failedRows: [] as Record<string, unknown>[],
    };

    const client = await clerkClient();

    for (const row of data) {
      const currentFailedRow = { ...row } as Record<string, unknown>;

      try {
        // Flexible mapping to support various header formats
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
        const password = row.password || row["Password"] || row.PASSWORD;

        // Validations
        if (!firstName || !lastName || !email) {
          const msg = "Missing required fields (firstName, lastName, email)";
          results.errors.push(`Row skipped for ${email || 'unknown'}: ${msg}`);
          currentFailedRow.Error = msg;
          results.failedRows.push(currentFailedRow);
          results.failed++;
          continue;
        }

        if (createUserAccounts && !password) {
          const msg = "Password is required for creating Clerk user";
          results.errors.push(`Row skipped for ${email}: ${msg}`);
          currentFailedRow.Error = msg;
          results.failedRows.push(currentFailedRow);
          results.failed++;
          continue;
        }

        // Check if teacher already exists in teachers table
        const existingTeacher = await db
          .select()
          .from(teachers)
          .where(eq(teachers.email, email))
          .limit(1);

        if (existingTeacher.length > 0) {
          const msg = `Teacher with email ${email} already exists in database`;
          results.errors.push(msg);
          currentFailedRow.Error = msg;
          results.failedRows.push(currentFailedRow);
          results.failed++;
          continue;
        }

        // Check if user already exists in users table
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingUser.length > 0) {
          const msg = `User with email ${email} already exists in database`;
          results.errors.push(msg);
          currentFailedRow.Error = msg;
          results.failedRows.push(currentFailedRow);
          results.failed++;
          continue;
        }

        let clerkId = `clerk_teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        let userId: string | null = null;

        // Create in Clerk
        try {
          await client.users.createUser({
            emailAddress: [email],
            firstName,
            lastName,
            password,
            skipPasswordChecks: false,
          });
          // Fetch the created user to get the true ID
          const createdClerkUser = await client.users.getUserList({ emailAddress: [email] });
          if (createdClerkUser.data.length > 0) {
            clerkId = createdClerkUser.data[0].id;
          }
        } catch (clerkError: any) {
          let errorMessage = clerkError.errors?.[0]?.message || clerkError.message;
          // Handle if user already exists in Clerk
          if (clerkError.errors && clerkError.errors[0]?.code === "form_identifier_exists") {
            errorMessage = "User already exists in Clerk system";
          }

          results.errors.push(`Clerk Error for ${email}: ${errorMessage}`);
          currentFailedRow.Error = `Clerk API: ${errorMessage}`;
          results.failedRows.push(currentFailedRow);
          results.failed++;
          continue;
        }

        // Hash password
        const hashedPassword = await hash(password, 10);

        // Create user in DB
        const [newUser] = await db.insert(users).values({
          email,
          name: middleName
            ? `${firstName} ${middleName} ${lastName}`
            : `${firstName} ${lastName}`,
          role: "TEACHER",
          clerkId: clerkId,
          password: hashedPassword,
          image: null,
        }).returning();

        userId = newUser.id;

        // Normalize gender value
        const normalizedGender = gender ?
          (gender.toLowerCase() === 'male' || gender.toLowerCase() === 'laki-laki' || gender.toLowerCase() === 'l' ? 'male' :
            gender.toLowerCase() === 'female' || gender.toLowerCase() === 'perempuan' || gender.toLowerCase() === 'p' ? 'female' :
              null) : null;

        // Create teacher record
        await db.insert(teachers).values({
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
          userId,
        });

        results.success++;
      } catch (rowError: any) {
        console.error("Error processing row:", rowError);
        const errorMsg = rowError instanceof Error ? rowError.message : "Unknown error";
        results.failed++;
        results.errors.push(`Row error: ${errorMsg}`);
        currentFailedRow.Error = errorMsg;
        results.failedRows.push(currentFailedRow);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.success} teachers added, ${results.failed} failed`,
      details: results,
    });
  } catch (error) {
    console.error("Error importing teachers:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to import teachers",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
