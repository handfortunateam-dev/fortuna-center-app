import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@/enums/common";
import { getUserByClerkId } from "@/services/userSyncService";

export interface AuthUser {
  id: string; // Database ID
  clerkId: string | null; // Clerk User ID (nullable until webhook syncs)
  email: string | null;
  name: string;
  image: string | null;
  role: UserRole;
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
  const dbUser = await getUserByClerkId(userId);

  if (!dbUser) {
    console.warn(`User ${userId} not found in database. Make sure webhook is set up.`);
    return null;
  }

  return {
    id: dbUser.id.toString(),
    clerkId: dbUser.clerkId,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image,
    role: dbUser.role as UserRole,
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
