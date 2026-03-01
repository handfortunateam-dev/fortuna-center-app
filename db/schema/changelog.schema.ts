import { pgEnum, pgTable, text, varchar, uuid, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { id, timestampsWithSoftDelete } from "./columns.helper";

export const changelogTypeEnum = pgEnum("changelog_type", [
  "FEATURE",
  "BUG_FIX",
  "IMPROVEMENT",
  "UPDATE"
]);

export const changelogs = pgTable("changelogs", {
  ...id,
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: changelogTypeEnum("type").notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  authorId: uuid("author_id")
    .references(() => users.id)
    .notNull(),
  ...timestampsWithSoftDelete,
});

export type Changelog = typeof changelogs.$inferSelect;
export type NewChangelog = typeof changelogs.$inferInsert;
