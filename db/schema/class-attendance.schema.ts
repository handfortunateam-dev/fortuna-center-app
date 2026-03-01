import { pgTable, text, uuid, pgEnum, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { students } from './students.schema';
import { classSessions } from './class-session.schema';
import { id } from './columns.helper';

// Attendance status enum
export const attendanceStatusEnum = pgEnum('attendance_status', [
  'present',   // Hadir
  'absent',    // Tidak hadir
  'late',      // Terlambat
  'excused',   // Izin
  'sick',      // Sakit
]);

// Class Attendance table - tracks attendance per session per student
export const classAttendances = pgTable('class_attendances', {
  ...id,

  // References
  sessionId: uuid('session_id').references(() => classSessions.id, { onDelete: 'cascade' }).notNull(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),

  // Attendance details
  status: attendanceStatusEnum('status').default('absent').notNull(), // Default absent, updated when present

  // Optional
  notes: text('notes'), // e.g., "Arrived 10 minutes late", "Doctor's note provided"
  checkedInAt: timestamp('checked_in_at'), // Actual check-in time (if present/late)

  // Audit
  recordedBy: uuid('recorded_by').references(() => users.id), // Teacher/admin who recorded
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
});

// Type exports
export type ClassAttendance = typeof classAttendances.$inferSelect;
export type NewClassAttendance = typeof classAttendances.$inferInsert;
