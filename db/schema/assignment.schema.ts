import { pgTable, text, timestamp, uuid, pgEnum, integer } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { classes } from './class.schema';
import { id, timestamps, publishable } from './columns.helper';

// Assignment status enum
export const assignmentStatusEnum = pgEnum('assignment_status', [
  'draft',
  'published',
  'closed'
]);

// Submission status enum (exported for use in assignment-submission.schema.ts)
export const submissionStatusEnum = pgEnum('submission_status', [
  'pending',
  'submitted',
  'graded',
  'late'
]);

// Assignments table
export const assignments = pgTable('assignments', {
  ...id,
  title: text('title').notNull(),
  description: text('description'),
  instructions: text('instructions'),
  classId: uuid('class_id').references(() => classes.id).notNull(),
  teacherId: uuid('teacher_id').references(() => users.id).notNull(), // Teacher who created it
  status: assignmentStatusEnum('status').default('draft').notNull(),
  maxScore: integer('max_score').default(100),
  dueDate: timestamp('due_date'),
  ...publishable,
  ...timestamps,
});

// Type exports
export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;
