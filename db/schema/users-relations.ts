import { relations } from "drizzle-orm";
import { users } from "./users.schema";
import { students } from "./students.schema";

export const usersRelations = relations(users, ({ one }) => ({
    student: one(students, {
        fields: [users.id],
        references: [students.userId],
    }),
}));
