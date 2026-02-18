import { relations } from 'drizzle-orm';
import { classes } from './class.schema';
import { classEnrollments } from './class-enrollment.schema';
import { teacherClasses } from './teacher-class.schema';

export const classesRelations = relations(classes, ({ many }) => ({
    enrollments: many(classEnrollments, { relationName: 'enrollmentClass' }),
    teacherClasses: many(teacherClasses, { relationName: 'teacherClassClass' }),
}));
