import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { id } from "./columns.helper";
import { posts } from "./posts.schema";
import { postCategories } from "./post-category.schema";

export const postToCategories = pgTable("post_to_categories", {
  ...id,
  postId: uuid("post_id")
    .references(() => posts.id)
    .notNull(),
  categoryId: uuid("category_id")
    .references(() => postCategories.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PostToCategory = typeof postToCategories.$inferSelect;
export type NewPostToCategory = typeof postToCategories.$inferInsert;
