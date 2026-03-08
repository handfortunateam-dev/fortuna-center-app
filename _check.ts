import { db } from "./db";
import { users } from "./db/schema/users.schema";
import { eq } from "drizzle-orm";

async function main() {
    const result = await db.select().from(users).where(eq(users.clerkId, "user_3AcO3KPgB5ShLMuPl6dZFiZpIcE"));
    console.log("DB RESULT:", result);
    process.exit(0);
}

main();
