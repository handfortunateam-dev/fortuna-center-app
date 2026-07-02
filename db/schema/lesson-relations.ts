import { relations } from 'drizzle-orm';
import { lessons } from './lesson.schema';
import { lessonMaterials } from './lesson-material.schema';
import { classes } from './class.schema';

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
    class: one(classes, {
        fields: [lessons.classId],
        references: [classes.id],
        relationName: 'classLessons',
    }),
    materials: many(lessonMaterials, { relationName: 'lessonMaterials' }),
}));

export const lessonMaterialsRelations = relations(lessonMaterials, ({ one }) => ({
    lesson: one(lessons, {
        fields: [lessonMaterials.lessonId],
        references: [lessons.id],
        relationName: 'lessonMaterials',
    }),
}));
