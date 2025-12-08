import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { id } from "./columns.helper";
import { posts } from "./posts.schema";
import { postTags } from "./post-tag.schema";

export const postToTags = pgTable("post_to_tags", {
  ...id,
  postId: uuid("post_id")
    .references(() => posts.id)
    .notNull(),
  tagId: uuid("tag_id")
    .references(() => postTags.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PostToTag = typeof postToTags.$inferSelect;
export type NewPostToTag = typeof postToTags.$inferInsert;
