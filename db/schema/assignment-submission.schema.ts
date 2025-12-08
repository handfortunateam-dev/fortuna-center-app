import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { assignments, submissionStatusEnum } from './assignment.schema';
import { id, timestamps } from './columns.helper';

// Assignment submissions
export const assignmentSubmissions = pgTable('assignment_submissions', {
  ...id,
  assignmentId: uuid('assignment_id').references(() => assignments.id).notNull(),
  studentId: uuid('student_id').references(() => users.id).notNull(),
  content: text('content'), // Submission text/content
  attachmentUrl: text('attachment_url'), // Optional file attachment
  status: submissionStatusEnum('status').default('pending').notNull(),
  score: integer('score'),
  feedback: text('feedback'), // Teacher's feedback
  gradedBy: uuid('graded_by').references(() => users.id), // Teacher who graded
  submittedAt: timestamp('submitted_at'),
  gradedAt: timestamp('graded_at'),
  ...timestamps,
});

// Type exports
export type AssignmentSubmission = typeof assignmentSubmissions.$inferSelect;
export type NewAssignmentSubmission = typeof assignmentSubmissions.$inferInsert;
