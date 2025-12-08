import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { classes } from './class.schema';
import { id } from './columns.helper';

// Student-Class enrollment (many-to-many)
export const classEnrollments = pgTable('class_enrollments', {
  ...id,
  studentId: uuid('student_id').references(() => users.id).notNull(),
  classId: uuid('class_id').references(() => classes.id).notNull(),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  enrolledBy: uuid('enrolled_by').references(() => users.id), // Admin who enrolled
});

// Type exports
export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type NewClassEnrollment = typeof classEnrollments.$inferInsert;
