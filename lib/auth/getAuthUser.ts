import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@/enums/common";
import { getUserByClerkId, syncUserToDatabase } from "@/services/userSyncService";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { eq } from "drizzle-orm";

export interface AuthUser {
  id: string; // Database ID
  clerkId: string | null; // Clerk User ID (nullable until webhook syncs)
  email: string | null;
  name: string;
  image: string | null;
  role: UserRole;
  isAdminEmployeeAlso: boolean;
}

/**
 * Get authenticated user with data from database.
 * Supports both Clerk auth and local session cookie (local auth mode).
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  // ── 1. Try Clerk auth ─────────────────────────────────────────────────────
  const { userId } = await auth();

  if (userId) {
    // Get user from database using Clerk ID
    let dbUser = await getUserByClerkId(userId);

    if (!dbUser) {
      console.warn(`User ${userId} not found in database. Attempting to sync from Clerk...`);

      try {
        const clerkUser = await currentUser();

        if (clerkUser) {
          dbUser = await syncUserToDatabase({
            id: clerkUser.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            email_addresses: clerkUser.emailAddresses.map((e: any) => ({
              email_address: e.emailAddress,
              id: e.id
            })),
            first_name: clerkUser.firstName,
            last_name: clerkUser.lastName,
            image_url: clerkUser.imageUrl,
            username: clerkUser.username,
          });
        }
      } catch (error) {
        console.error("Failed to sync user from Clerk:", error);
      }
    }

    if (dbUser) {
      return {
        id: dbUser.id.toString(),
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
        role: dbUser.role as UserRole,
        isAdminEmployeeAlso: dbUser.isAdminEmployeeAlso,
      };
    }
  }

  // ── 2. Fallback: local_session cookie (local auth mode) ───────────────────
  try {
    const cookieStore = await cookies();
    const localSessionId = cookieStore.get("local_session")?.value;

    if (localSessionId) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, localSessionId))
        .limit(1);

      if (result.length > 0) {
        const u = result[0];
        return {
          id: u.id,
          clerkId: u.clerkId,
          email: u.email,
          name: u.name,
          image: u.image,
          role: u.role as UserRole,
          isAdminEmployeeAlso: u.isAdminEmployeeAlso,
        };
      }
    }
  } catch {
    // cookies() may fail in contexts where it's not available (e.g. API routes using NextRequest)
    // those contexts use the req.cookies approach in /api/auth/me instead
  }

  return null;
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getAuthUser();
  return user?.role === UserRole.ADMIN;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthUser();
  return user !== null;
}
