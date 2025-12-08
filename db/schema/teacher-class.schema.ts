import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { classes } from './class.schema';
import { id } from './columns.helper';

// Teacher-Class relationship (many-to-many)
// Any teacher can teach any class - no permanent assignment
export const teacherClasses = pgTable('teacher_classes', {
  ...id,
  teacherId: uuid('teacher_id').references(() => users.id).notNull(),
  classId: uuid('class_id').references(() => classes.id).notNull(),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  assignedBy: uuid('assigned_by').references(() => users.id), // Admin who assigned
});

// Type exports
export type TeacherClass = typeof teacherClasses.$inferSelect;
export type NewTeacherClass = typeof teacherClasses.$inferInsert;
