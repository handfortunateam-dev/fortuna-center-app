import { clerkClient } from "@clerk/nextjs/server";

/**
 * Fetch user list from Clerk with pagination and filters
 */
export async function getClerkUserList(params?: {
  limit?: number;
  offset?: number;
  orderBy?: "-created_at" | "created_at" | "-updated_at" | "updated_at";
  query?: string;
  emailAddress?: string[];
  organizationId?: string[];
}) {
  const client = await clerkClient();

  const config: Parameters<typeof client.users.getUserList>[0] = {
    limit: params?.limit || 10,
    offset: params?.offset || 0,
    query: params?.query,
    emailAddress: params?.emailAddress,
    organizationId: params?.organizationId,
  };

  // Only add orderBy if it's explicitly provided
  if (params?.orderBy) {
    config.orderBy = params.orderBy;
  }

  const response = await client.users.getUserList(config);

  return response;
}

/**
 * Get single user from Clerk by ID
 */
export async function getClerkUser(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user;
}
