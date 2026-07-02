import { pgTable, text, uuid, boolean, smallint, time, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { classes } from './class.schema';
import { id, timestamps } from './columns.helper';

// Day of week enum (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
export const dayOfWeekEnum = pgEnum('day_of_week', [
  '0', // Sunday
  '1', // Monday
  '2', // Tuesday
  '3', // Wednesday
  '4', // Thursday
  '5', // Friday
  '6', // Saturday
]);

// Class Schedule table - recurring schedule (permanent, not per-semester)
// Teachers are assigned via schedule_teachers junction table
export const classSchedules = pgTable('class_schedules', {
  ...id,

  // References
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'cascade' }).notNull(),

  // Schedule details
  dayOfWeek: smallint('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  startTime: time('start_time').notNull(), // e.g., '15:00:00'
  endTime: time('end_time').notNull(), // e.g., '16:30:00'

  // Optional
  location: text('location'), // e.g., "Room 101"
  notes: text('notes'), // Any additional notes

  // Status
  isActive: boolean('is_active').default(true).notNull(),

  // Audit
  createdBy: uuid('created_by').references(() => users.id),
  ...timestamps,
});

// Type exports
export type ClassSchedule = typeof classSchedules.$inferSelect;
export type NewClassSchedule = typeof classSchedules.$inferInsert;
