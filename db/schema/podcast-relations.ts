import { relations } from "drizzle-orm";
import { podcasts } from "./podcast.schema";
import { podcastEpisodes } from "./podcast-episode.schema";
import { podcastComments } from "./podcast-comment.schema";
import { podcastLikes } from "./podcast-like.schema";
import { users } from "./users.schema";

export const podcastsRelations = relations(podcasts, ({ one, many }) => ({
  author: one(users, {
    fields: [podcasts.authorId],
    references: [users.id],
  }),
  episodes: many(podcastEpisodes),
}));

export const podcastEpisodesRelations = relations(podcastEpisodes, ({ one, many }) => ({
  podcast: one(podcasts, {
    fields: [podcastEpisodes.podcastId],
    references: [podcasts.id],
  }),
  comments: many(podcastComments),
  likes: many(podcastLikes),
}));

export const podcastCommentsRelations = relations(podcastComments, ({ one, many }) => ({
  episode: one(podcastEpisodes, {
    fields: [podcastComments.episodeId],
    references: [podcastEpisodes.id],
  }),
  author: one(users, {
    fields: [podcastComments.authorId],
    references: [users.id],
  }),
  parent: one(podcastComments, {
    fields: [podcastComments.parentId],
    references: [podcastComments.id],
    relationName: "podcast_comment_replies",
  }),
  replies: many(podcastComments, {
    relationName: "podcast_comment_replies",
  }),
}));

export const podcastLikesRelations = relations(podcastLikes, ({ one }) => ({
  episode: one(podcastEpisodes, {
    fields: [podcastLikes.episodeId],
    references: [podcastEpisodes.id],
  }),
}));
