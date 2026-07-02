import { relations } from 'drizzle-orm';
import { scheduleTeachers } from './schedule-teacher.schema';
import { classSchedules } from './class-schedule.schema';
import { users } from './users.schema';

export const scheduleTeachersRelations = relations(scheduleTeachers, ({ one }) => ({
  schedule: one(classSchedules, {
    fields: [scheduleTeachers.scheduleId],
    references: [classSchedules.id],
  }),
  teacher: one(users, {
    fields: [scheduleTeachers.teacherId],
    references: [users.id],
    relationName: 'scheduleTeacherAssignment',
  }),
  assignedByUser: one(users, {
    fields: [scheduleTeachers.assignedBy],
    references: [users.id],
    relationName: 'scheduleTeacherAssigner',
  }),
}));
