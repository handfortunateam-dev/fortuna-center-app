import { pgTable, text, date, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { id, timestamps } from "./columns.helper";
import { registrationLinks } from "./registration-link.schema";

export const registrationStatusEnum = pgEnum("registration_status", [
  "pending",
  "reviewed",
  "accepted",
  "rejected",
]);

export const registrations = pgTable("registrations", {
  ...id,

  // Link tracking
  linkSlug: text("link_slug")
    .notNull()
    .references(() => registrationLinks.slug),

  // Identitas
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  nickname: text("nickname"),
  gender: text("gender", { enum: ["male", "female"] }).notNull(),
  placeOfBirth: text("place_of_birth"),
  dateOfBirth: date("date_of_birth"),

  // Kontak
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),

  // Pendidikan / Pekerjaan
  education: text("education"),
  occupation: text("occupation"),

  // Admin
  status: registrationStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"), // catatan dari admin

  ...timestamps,
});

export const registrationsRelations = relations(registrations, ({ one }) => ({
  link: one(registrationLinks, {
    fields: [registrations.linkSlug],
    references: [registrationLinks.slug],
  }),
}));

export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;
