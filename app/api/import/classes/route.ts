import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { classes, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, user.id))
            .limit(1);

        if (!dbUser || dbUser.length === 0) {
            return NextResponse.json(
                { success: false, message: "User not found in database" },
                { status: 404 }
            );
        }

        const createdBy = dbUser[0].id;

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
            failedRows: [] as Record<string, unknown>[],
        };

        for (const row of data) {
            const currentFailedRow = { ...row } as Record<string, unknown>;
            try {
                // Map fields
                const code = row.code || row["Class Code"] || row["ClassCode"] || row["Code"] || row["code"];
                const name = row.name || row["Class Name"] || row["Name"] || row["ClassName"] || row["name"];
                const description = row.description || row["Description"] || row["description"] || "";
                const isActiveRaw = row.isActive || row["Active"] || row["is active"] || row["IsActive"] || true;

                const isActive =
                    String(isActiveRaw).toLowerCase() === "true" ||
                    String(isActiveRaw).toLowerCase() === "yes" ||
                    isActiveRaw === true;

                // Validation
                if (!code || !name) {
                    const msg = "Missing required fields (Class Code, Class Name)";
                    results.errors.push(`Row skipped: ${msg}`);
                    currentFailedRow.Error = msg;
                    results.failedRows.push(currentFailedRow);
                    results.failed++;
                    continue;
                }

                // Check for duplicate code
                const existingClass = await db
                    .select()
                    .from(classes)
                    .where(eq(classes.code, code))
                    .limit(1);

                if (existingClass.length > 0) {
                    const msg = `Class with code '${code}' already exists`;
                    results.errors.push(msg);
                    currentFailedRow.Error = msg;
                    results.failedRows.push(currentFailedRow);
                    results.failed++;
                    continue;
                }

                // Create class
                await db.insert(classes).values({
                    code,
                    name,
                    description,
                    isActive,
                    createdBy,
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
            message: `Import completed: ${results.success} classes added, ${results.failed} failed`,
            details: results,
        });
    } catch (error) {
        console.error("Error importing classes:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to import classes",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
