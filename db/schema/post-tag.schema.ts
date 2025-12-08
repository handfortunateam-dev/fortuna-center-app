import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { id } from "./columns.helper";

export const postTags = pgTable("post_tags", {
  ...id,
  name: varchar("name", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PostTag = typeof postTags.$inferSelect;
export type NewPostTag = typeof postTags.$inferInsert;
