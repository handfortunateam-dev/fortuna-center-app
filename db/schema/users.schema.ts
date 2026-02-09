import { pgTable, text, varchar, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { id, timestamps } from './columns.helper';

// Role enum
export const userRoleEnum = pgEnum('user_role', [
  'ADMINISTRATIVE_EMPLOYEE',
  'ADMIN',
  'TEACHER',
  'STUDENT'
]);

// Users table
export const users = pgTable('users', {
  ...id,
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  image: varchar("image", { length: 500 }),
  password: text('password'), // hashed password
  ...timestamps,
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
