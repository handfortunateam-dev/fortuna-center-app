import { pgTable, text, uuid, pgEnum, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { id, timestamps } from './columns.helper';

// Ticket status enum
export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',      // Open - baru dibuat
  'in_progress', // In Progress - sedang ditangani
  'resolved',  // Resolved - sudah selesai
  'closed',    // Closed - ditutup
]);

// Ticket category enum
export const ticketCategoryEnum = pgEnum('ticket_category', [
  'bug',           // Bug报告
  'feature_request', // 功能请求
  'billing',       // 账单问题
  'other',         // 其他
]);

// Support tickets table
export const tickets = pgTable('tickets', {
  ...id,

  // User who created the ticket
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Ticket details
  subject: text('subject').notNull(),
  category: ticketCategoryEnum('category').notNull(),
  description: text('description').notNull(),

  // Status
  status: ticketStatusEnum('status').default('open').notNull(),

  // Admin response (optional)
  adminResponse: text('admin_response'),

  // Who assigned/resolved the ticket
  assignedTo: uuid('assigned_to').references(() => users.id),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),

  ...timestamps,
});

// Type exports
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
