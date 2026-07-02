import { pgEnum, pgTable, text, varchar, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { id, publishable, timestamps } from "./columns.helper";

export const podcastStatusEnum = pgEnum("podcast_status", ["draft", "published", "archived"]);

export const podcasts = pgTable("podcasts", {
  ...id,
  title: text("title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  coverImage: varchar("cover_image", { length: 500 }),
  authorId: uuid("author_id")
    .references(() => users.id)
    .notNull(),
  status: podcastStatusEnum("status").default("draft").notNull(),
  episodeCount: integer("episode_count").default(0).notNull(),
  ...publishable,
  ...timestamps,
});

export type PodcastShow = typeof podcasts.$inferSelect;
export type NewPodcastShow = typeof podcasts.$inferInsert;
