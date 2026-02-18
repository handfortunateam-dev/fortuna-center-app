import { pgEnum, pgTable, text, varchar, uuid, integer, real } from "drizzle-orm/pg-core";
import { podcasts } from "./podcast.schema";
import { id, publishable, timestamps } from "./columns.helper";

export const podcastEpisodeStatusEnum = pgEnum("podcast_episode_status", ["draft", "published", "archived"]);

export const podcastEpisodes = pgTable("podcast_episodes", {
  ...id,
  title: text("title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  audioUrl: varchar("audio_url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  duration: real("duration"),
  episodeNumber: integer("episode_number"),
  seasonNumber: integer("season_number"),
  podcastId: uuid("podcast_id")
    .references(() => podcasts.id)
    .notNull(),
  status: podcastEpisodeStatusEnum("status").default("draft").notNull(),
  playCount: integer("play_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  ...publishable,
  ...timestamps,
});

export type PodcastEpisode = typeof podcastEpisodes.$inferSelect;
export type NewPodcastEpisode = typeof podcastEpisodes.$inferInsert;
