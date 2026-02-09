import { relations } from 'drizzle-orm';
import { classEnrollments } from './class-enrollment.schema';
import { users } from './users.schema';
import { classes } from './class.schema';

export const classEnrollmentsRelations = relations(classEnrollments, ({ one }) => ({
    student: one(users, {
        fields: [classEnrollments.studentId],
        references: [users.id],
        relationName: 'enrollmentStudent',
    }),
    class: one(classes, {
        fields: [classEnrollments.classId],
        references: [classes.id],
        relationName: 'enrollmentClass',
    }),
}));
