import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { id, timestamps } from "./columns.helper";
import { registrations } from "./registration.schema";

export const registrationLinks = pgTable("registration_links", {
  ...id,
  slug: text("slug").notNull().unique(), // e.g., "main-entrance", "brosur-2025"
  label: text("label").notNull(), // e.g., "Pintu Masuk Utama", "Brosur 2025"
  description: text("description"), // optional note
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

export const registrationLinksRelations = relations(
  registrationLinks,
  ({ many }) => ({
    registrations: many(registrations),
  }),
);

export type RegistrationLink = typeof registrationLinks.$inferSelect;
export type NewRegistrationLink = typeof registrationLinks.$inferInsert;
