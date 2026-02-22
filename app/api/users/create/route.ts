
import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { UserRole } from "@/enums/common";

interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: "ADMIN" | "VISITOR";
  isAdminEmployeeAlso?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Please login first",
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden - Only admins can create users",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body: CreateUserRequest = await request.json();

    // Validate required fields
    if (!body.email || !body.firstName || !body.password || !body.role) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: email, firstName, password, role",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(UserRole).includes(body.role as UserRole)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid role. Must be one of: ${Object.values(UserRole).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Create user in Clerk
    const client = await clerkClient();

    // Log the request data for debugging
    console.log("Creating Clerk user with data:", {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      password: body.password ? "***" : undefined,
    });

    const createUserParams: Parameters<typeof client.users.createUser>[0] = {
      emailAddress: [body.email],
      password: body.password,
      firstName: body.firstName,
    };

    // Only add lastName if provided
    if (body.lastName) {
      createUserParams.lastName = body.lastName;
    }

    const clerkUser = await client.users.createUser(createUserParams);

    // Hash password for local database storage if provided
    let hashedPassword = null;
    if (body.password) {
      // Import bcrypt dynamically to avoid issues if not used or to ensure it's loaded
      const bcrypt = await import("bcryptjs");
      hashedPassword = await bcrypt.hash(body.password, 10);
    }

    // Create user in database with specified role
    const dbUser = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        name: `${body.firstName} ${body.lastName || ""}`.trim(),
        email: body.email,
        image: clerkUser.imageUrl,
        role: body.role as UserRole,
        password: hashedPassword, // Save hashed password
        isAdminEmployeeAlso: body.isAdminEmployeeAlso || false,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: {
          id: dbUser[0].id,
          clerkId: dbUser[0].clerkId,
          email: dbUser[0].email,
          name: dbUser[0].name,
          role: dbUser[0].role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle Clerk-specific errors
    if (error instanceof Error) {
      const errorMessage = error.message || "";

      // Log detailed error info
      console.error("Error details:", {
        message: errorMessage,
        cause: error.cause,
        errors: (error as unknown as Record<string, unknown>).errors,
      });

      if (errorMessage.includes("already exists")) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already exists",
          },
          { status: 400 }
        );
      }

      // Check for Clerk validation errors
      const errorObj = error as unknown as Record<string, unknown>;
      if (errorObj.errors && Array.isArray(errorObj.errors)) {
        const clerkErrors = errorObj.errors;
        console.error("Clerk validation errors:", JSON.stringify(clerkErrors, null, 2));
        const errorDetails = clerkErrors.map((e: unknown) => {
          const err = e as Record<string, unknown>;
          return (err.message as string) || (err.code as string) || String(e);
        }).join(", ");
        return NextResponse.json(
          {
            success: false,
            message: `Validation error: ${errorDetails}`,
            details: clerkErrors,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: errorMessage || "Failed to create user",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
      },
      { status: 500 }
    );
  }
}