import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { id } from "./columns.helper";
import { posts } from "./posts.schema";
import { users } from "./users.schema";

export const postLikes = pgTable("post_likes", {
  ...id,
  postId: uuid("post_id")
    .references(() => posts.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PostLike = typeof postLikes.$inferSelect;
export type NewPostLike = typeof postLikes.$inferInsert;
