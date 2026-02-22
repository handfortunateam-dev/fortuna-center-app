import { pgTable, text, varchar, pgEnum, boolean } from 'drizzle-orm/pg-core';
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
  isAdminEmployeeAlso: boolean('is_admin_employee_also').default(false).notNull(),
  ...timestamps,
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
