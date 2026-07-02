import { pgTable, uuid, timestamp, varchar } from "drizzle-orm/pg-core";
import { id } from "./columns.helper";
import { posts } from "./posts.schema";

export const postLikes = pgTable("post_likes", {
  ...id,
  postId: uuid("post_id")
    .references(() => posts.id)
    .notNull(),
  visitorId: varchar("visitor_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PostLike = typeof postLikes.$inferSelect;
export type NewPostLike = typeof postLikes.$inferInsert;
