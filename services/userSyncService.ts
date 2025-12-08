// import { db } from "@/db/schema/db";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { eq } from "drizzle-orm";

export interface ClerkUserData {
  id: string; // Clerk user ID
  email_addresses: Array<{
    email_address: string;
    id: string;
  }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  username: string | null;
}

/**
 * Sync user from Clerk to database
 * Called by webhook when user is created/updated in Clerk
 */
export async function syncUserToDatabase(clerkUser: ClerkUserData) {
  const primaryEmail = clerkUser.email_addresses[0]?.email_address;

  if (!primaryEmail) {
    throw new Error("No email found for user");
  }

  const name =
    clerkUser.username ||
    `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() ||
    primaryEmail.split("@")[0];

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (existingUser.length > 0) {
    // Update existing user
    const updated = await db
      .update(users)
      .set({
        name,
        email: primaryEmail,
        image: clerkUser.image_url,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, clerkUser.id))
      .returning();

    return updated[0];
  } else {
    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        name,
        email: primaryEmail,
        image: clerkUser.image_url,
        role: "STUDENT", // Default role (matches enum: ADMIN or VISITOR)
      })
      .returning();

    return newUser[0];
  }
}

/**
 * Delete user from database
 * Called by webhook when user is deleted in Clerk
 */
export async function deleteUserFromDatabase(clerkUserId: string) {
  await db
    .delete(users)
    .where(eq(users.clerkId, clerkUserId));
}

/**
 * Get user from database by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return user[0] || null;
}

/**
 * Update user role in database
 */
export async function updateUserRole(clerkId: string, role: "ADMIN" | "VISITOR") {
  const updated = await db
    .update(users)
    .set({
      role: role as never, // VARCHAR type
      updatedAt: new Date(),
    })
    .where(eq(users.clerkId, clerkId))
    .returning();

  return updated[0];
}