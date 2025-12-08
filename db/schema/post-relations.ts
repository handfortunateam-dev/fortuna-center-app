import { relations } from "drizzle-orm";
import { posts } from "./posts.schema";
import { users } from "./users.schema";
import { postToCategories } from "./post-to-category.schema";
import { postToTags } from "./post-to-tag.schema";
import { postComments } from "./post-comment.schema";
import { postLikes } from "./post-like.schema";
import { postCategories } from "./post-category.schema";
import { postTags } from "./post-tag.schema";

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  categories: many(postToCategories),
  tags: many(postToTags),
  comments: many(postComments),
  likes: many(postLikes),
}));

export const postCategoriesRelations = relations(postCategories, ({ many }) => ({
  posts: many(postToCategories),
}));

export const postToCategoriesRelations = relations(postToCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postToCategories.postId],
    references: [posts.id],
  }),
  category: one(postCategories, {
    fields: [postToCategories.categoryId],
    references: [postCategories.id],
  }),
}));

export const postTagsRelations = relations(postTags, ({ many }) => ({
  posts: many(postToTags),
}));

export const postToTagsRelations = relations(postToTags, ({ one }) => ({
  post: one(posts, {
    fields: [postToTags.postId],
    references: [posts.id],
  }),
  tag: one(postTags, {
    fields: [postToTags.tagId],
    references: [postTags.id],
  }),
}));

export const postCommentsRelations = relations(postComments, ({ one, many }) => ({
  post: one(posts, {
    fields: [postComments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [postComments.authorId],
    references: [users.id],
  }),
  parent: one(postComments, {
    fields: [postComments.parentId],
    references: [postComments.id],
    relationName: "comment_replies",
  }),
  replies: many(postComments, {
    relationName: "comment_replies",
  }),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));
