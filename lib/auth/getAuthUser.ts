import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@/enums/common";
import { getUserByClerkId, syncUserToDatabase } from "@/services/userSyncService";

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
 * Get authenticated user with data from database
 * User must be synced to database via Clerk webhook
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Get user from database using Clerk ID
  let dbUser = await getUserByClerkId(userId);

  if (!dbUser) {
    console.warn(`User ${userId} not found in database. Attempting to sync from Clerk...`);

    try {
      // Fallback: Fetch from Clerk and sync
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

  if (!dbUser) {
    console.warn(`User ${userId} still not found in database after sync attempt.`);
    return null;
  }

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
