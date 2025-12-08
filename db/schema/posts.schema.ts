import { pgEnum, pgTable, text, varchar, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { id, publishable, timestamps } from "./columns.helper";

export const postStatusEnum = pgEnum("post_status", ["draft", "published", "archived"]);

export const posts = pgTable("posts", {
  ...id,
  title: text("title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: varchar("cover_image", { length: 500 }),
  authorId: uuid("author_id")
    .references(() => users.id)
    .notNull(),
  status: postStatusEnum("status").default("draft").notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  ...publishable,
  ...timestamps,
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
