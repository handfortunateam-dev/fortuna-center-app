import { pgTable, text, uuid, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { id, timestamps } from './columns.helper';

// Classes table
export const classes = pgTable('classes', {
  ...id,
  name: text('name').notNull(),
  description: text('description'),
  code: text('code').notNull().unique(), // e.g., "MATH101", "ENG201"
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(), // Admin who created the class
  ...timestamps,
});

// Type exports
export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
