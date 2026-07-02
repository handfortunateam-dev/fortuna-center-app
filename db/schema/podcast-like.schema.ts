import { pgTable, uuid, timestamp, varchar } from "drizzle-orm/pg-core";
import { id } from "./columns.helper";
import { podcastEpisodes } from "./podcast-episode.schema";

export const podcastLikes = pgTable("podcast_likes", {
  ...id,
  episodeId: uuid("episode_id")
    .references(() => podcastEpisodes.id)
    .notNull(),
  visitorId: varchar("visitor_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PodcastLike = typeof podcastLikes.$inferSelect;
export type NewPodcastLike = typeof podcastLikes.$inferInsert;
