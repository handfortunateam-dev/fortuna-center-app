import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const systemSettings = pgTable("system_settings", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    key: text("key").notNull().unique(),
    value: text("value"), // JSON string or simple value
    description: text("description"),
    updatedAt: timestamp("updated_at").defaultNow(),
});
