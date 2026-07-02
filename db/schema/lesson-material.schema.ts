import { pgTable, text, uuid, integer, pgEnum } from 'drizzle-orm/pg-core';
import { lessons } from './lesson.schema';
import { id, timestamps, publishable } from './columns.helper';

export const materialTypeEnum = pgEnum('material_type', [
    'video',   // YouTube link or uploaded video
    'pdf',     // Document
    'link',    // External URL
    'text',    // Rich text content
    'file',    // Generic file download
    'ppt',     // PowerPoint / Slides
    'audio'    // Audio files
]);

// Lesson Materials table (Content items within a lesson)
export const lessonMaterials = pgTable('lesson_materials', {
    ...id,
    title: text('title').notNull(),
    description: text('description'),
    lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
    type: materialTypeEnum('type').notNull(),
    content: text('content'), // URL or text content depending on type
    order: integer('order').default(0).notNull(),
    ...publishable,
    ...timestamps,
});

export type LessonMaterial = typeof lessonMaterials.$inferSelect;
export type NewLessonMaterial = typeof lessonMaterials.$inferInsert;
