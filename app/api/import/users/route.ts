import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, createUserAccounts } = body;

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
      failedRows: [] as Record<string, unknown>[], // New array to store failed rows along with reason
    };

    const client = await clerkClient();

    for (const row of data) {
      // Reconstruct original row for reporting purposes
      // Since 'row' coming in might be normalized or messy, we use what we have.
      // We will clone it to attach error message.
      const currentFailedRow = { ...row };

      try {
        // Flexible mapping to support various header formats
        const email = row.email || row["Email"] || row.EMAIL;
        const password = row.password || row["Password"] || row.PASSWORD;
        const firstName = row.firstName || row["First Name"] || row.firstname || row["first name"];
        const lastName = row.lastName || row["Last Name"] || row.lastname || row["last name"];
        const role = (row.role || row["Role"] || row.ROLE || "STUDENT").toUpperCase();

        // Validate required fields
        if (createUserAccounts && !password) {
          const msg = `Password is required for creating Clerk user`;
          results.errors.push(`Row skipped for ${email || 'unknown'}: ${msg}`);
          currentFailedRow.Error = msg;
          results.failedRows.push(currentFailedRow);
          results.failed++;
          continue;
        }

        if (!email || !firstName) {
          const msg = `Missing required fields (email, first name)`;
          results.errors.push(`Row skipped: ${msg}`);
          currentFailedRow.Error = msg;
          results.failedRows.push(currentFailedRow);
          results.failed++;
          continue;
        }

        // Validate role
        const validRoles = ["ADMIN", "TEACHER", "STUDENT", "ADMINISTRATIVE_EMPLOYEE"];
        if (!validRoles.includes(role)) {
          const msg = `Invalid role: ${role}. Must be one of: ${validRoles.join(", ")}`;
          results.errors.push(`Row for ${email}: ${msg}`);
          currentFailedRow.Error = msg;
          results.failedRows.push(currentFailedRow);
          results.failed++;
          continue;
        }

        // Check if user already exists in LOCAL DB
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

        let clerkId = `clerk_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        let clerkUser = null;

        // Create in Clerk if requested
        if (createUserAccounts) {
          try {
            // Constuct params similar to create user route
            const createUserParams: Parameters<typeof client.users.createUser>[0] = {
              emailAddress: [email],
              firstName,
              password,
              skipPasswordChecks: false,
            };

            if (lastName) {
              createUserParams.lastName = lastName;
            }

            clerkUser = await client.users.createUser(createUserParams);
            clerkId = clerkUser.id;
          } catch (clerkError: unknown) {
            const ce = clerkError as Record<string, unknown>;
            const ceErrors = ce.errors as Array<Record<string, string>> | undefined;
            let errorMessage: string = (ceErrors?.[0]?.message) || (ce.message as string) || "Unknown Clerk error";
            // Handle if user already exists in Clerk
            if (ceErrors && ceErrors[0]?.code === "form_identifier_exists") {
              errorMessage = "User already exists in Clerk (but not in local DB)";
            }

            results.errors.push(`Clerk Error for ${email}: ${errorMessage}`);
            currentFailedRow.Error = `Clerk API: ${errorMessage}`;
            results.failedRows.push(currentFailedRow);
            results.failed++;
            continue; // Skip DB insertion if Clerk failed
          }
        }

        // Hash password for local DB
        const hashedPassword = password ? await hash(password, 10) : null;

        // Create user in DB
        await db.insert(users).values({
          email,
          name: `${firstName} ${lastName ?? ""}`.trim(),
          role: role as "ADMIN" | "TEACHER" | "STUDENT" | "ADMINISTRATIVE_EMPLOYEE",
          clerkId: clerkId,
          password: hashedPassword,
        });

        results.success++;
      } catch (rowError: unknown) {
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
      message: `Import completed: ${results.success} users added, ${results.failed} failed`,
      details: results,
    });
  } catch (error) {
    console.error("Error importing users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to import users",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
