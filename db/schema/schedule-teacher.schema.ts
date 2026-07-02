import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { classSchedules } from './class-schedule.schema';
import { users } from './users.schema';
import { id } from './columns.helper';

// Junction table for many-to-many: schedule <-> teacher
export const scheduleTeachers = pgTable('schedule_teachers', {
  ...id,

  scheduleId: uuid('schedule_id').references(() => classSchedules.id, { onDelete: 'cascade' }).notNull(),
  teacherId: uuid('teacher_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  assignedBy: uuid('assigned_by').references(() => users.id),
});

// Type exports
export type ScheduleTeacher = typeof scheduleTeachers.$inferSelect;
export type NewScheduleTeacher = typeof scheduleTeachers.$inferInsert;
