import { pgTable, uuid, text, boolean } from "drizzle-orm/pg-core";
import { id, timestamps } from "./columns.helper";
import { posts } from "./posts.schema";
import { users } from "./users.schema";

export const postComments = pgTable("post_comments", {
  ...id,
  postId: uuid("post_id")
    .references(() => posts.id)
    .notNull(),
  authorId: uuid("author_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  parentId: uuid("parent_id").references((): any => postComments.id),
  isEdited: boolean("is_edited").default(false).notNull(),
  ...timestamps,
});

export type PostComment = typeof postComments.$inferSelect;
export type NewPostComment = typeof postComments.$inferInsert;
