import { pgTable, text, uuid, integer, boolean } from 'drizzle-orm/pg-core';
import { classes } from './class.schema';
import { id, timestamps, publishable } from './columns.helper';

// Lessons table (Modules/Chapters)
export const lessons = pgTable('lessons', {
    ...id,
    title: text('title').notNull(),
    description: text('description'),
    classId: uuid('class_id').references(() => classes.id, { onDelete: 'cascade' }).notNull(),
    order: integer('order').default(0).notNull(), // To sequence lessons
    ...publishable, // isPublished, publishedAt
    ...timestamps,
});

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
