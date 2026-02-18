import { pgTable, uuid, text, boolean } from "drizzle-orm/pg-core";
import { id, timestamps } from "./columns.helper";
import { podcastEpisodes } from "./podcast-episode.schema";
import { users } from "./users.schema";

export const podcastComments = pgTable("podcast_comments", {
  ...id,
  episodeId: uuid("episode_id")
    .references(() => podcastEpisodes.id)
    .notNull(),
  authorId: uuid("author_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  parentId: uuid("parent_id").references((): any => podcastComments.id),
  isEdited: boolean("is_edited").default(false).notNull(),
  ...timestamps,
});

export type PodcastComment = typeof podcastComments.$inferSelect;
export type NewPodcastComment = typeof podcastComments.$inferInsert;
