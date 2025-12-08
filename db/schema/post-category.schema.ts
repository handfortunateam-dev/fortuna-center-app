import { pgTable, varchar, text } from "drizzle-orm/pg-core";
import { id, timestamps } from "./columns.helper";

export const postCategories = pgTable("post_categories", {
  ...id,
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  ...timestamps,
});

export type PostCategory = typeof postCategories.$inferSelect;
export type NewPostCategory = typeof postCategories.$inferInsert;
