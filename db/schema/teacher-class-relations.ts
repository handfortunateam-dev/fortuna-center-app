import { relations } from 'drizzle-orm';
import { teacherClasses } from './teacher-class.schema';
import { users } from './users.schema';
import { classes } from './class.schema';

export const teacherClassesRelations = relations(teacherClasses, ({ one }) => ({
    teacher: one(users, {
        fields: [teacherClasses.teacherId],
        references: [users.id],
        relationName: 'teacherClassTeacher',
    }),
    class: one(classes, {
        fields: [teacherClasses.classId],
        references: [classes.id],
        relationName: 'teacherClassClass',
    }),
}));
