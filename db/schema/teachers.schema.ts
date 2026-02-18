import { pgTable, text, uuid, serial, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.schema";
import { id, timestamps } from "./columns.helper";

export const teachers = pgTable("teachers", {
    ...id,
    teacherNumber: serial("teacher_number").notNull(), // Nomor (auto-increment)

    // Nama
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    lastName: text("last_name").notNull(),

    // Jenis kelamin
    gender: text("gender", { enum: ["male", "female"] }), // "male" or "female"

    // Tempat tanggal lahir
    placeOfBirth: text("place_of_birth"), // Tempat lahir
    dateOfBirth: date("date_of_birth"), // Tanggal lahir

    // Contact & Address
    email: text("email").notNull().unique(),
    phone: text("phone"),
    address: text("address"),

    // Pendidikan terakhir
    education: text("education"), // Pendidikan terakhir

    userId: uuid("user_id").references(() => users.id).unique(),
    ...timestamps,
});

export const teachersRelations = relations(teachers, ({ one }) => ({
    user: one(users, {
        fields: [teachers.userId],
        references: [users.id],
    }),
}));
