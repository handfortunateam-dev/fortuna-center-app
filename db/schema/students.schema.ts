import { pgTable, text, uuid, serial, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.schema";
import { id, timestamps } from "./columns.helper";

export const students = pgTable("students", {
    ...id,
    studentNumber: serial("student_number").notNull(), // Nomor (auto-increment)
    studentId: text("student_id").notNull().unique(), // Nomor induk (unique identifier)
    registrationDate: date("registration_date").notNull().defaultNow(), // Tanggal registrasi

    // Nama
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    lastName: text("last_name").notNull(),
    nickname: text("nickname"), // Nama panggilan

    // Jenis kelamin
    gender: text("gender", { enum: ["male", "female"] }), // "male" or "female"

    // Tempat tanggal lahir
    placeOfBirth: text("place_of_birth"), // Tempat lahir
    dateOfBirth: date("date_of_birth"), // Tanggal lahir

    // Contact & Address
    email: text("email").unique(),
    phone: text("phone").notNull(),
    address: text("address"),

    // Pendidikan/pekerjaan
    education: text("education"), // Pendidikan terakhir
    occupation: text("occupation"), // Pekerjaan
    status: text("status", { enum: ["active", "inactive", "on_leave"] }).notNull().default("active"),

    userId: uuid("user_id").references(() => users.id).unique(),
    ...timestamps,
});

export const studentsRelations = relations(students, ({ one }) => ({
    user: one(users, {
        fields: [students.userId],
        references: [users.id],
    }),
}));