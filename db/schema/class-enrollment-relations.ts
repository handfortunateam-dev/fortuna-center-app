import { relations } from 'drizzle-orm';
import { classEnrollments } from './class-enrollment.schema';
import { students } from './students.schema';
import { classes } from './class.schema';

export const classEnrollmentsRelations = relations(classEnrollments, ({ one }) => ({
    student: one(students, {
        fields: [classEnrollments.studentId],
        references: [students.id],
        relationName: 'enrollmentStudent',
    }),
    class: one(classes, {
        fields: [classEnrollments.classId],
        references: [classes.id],
        relationName: 'enrollmentClass',
    }),
}));
