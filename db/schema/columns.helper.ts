import { timestamp, uuid } from "drizzle-orm/pg-core";

// Common ID column
export const id = {
    id: uuid('id').defaultRandom().primaryKey(),
};

// Common timestamp columns
export const timestamps = {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
};

// Timestamps with soft delete support
export const timestampsWithSoftDelete = {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
};

// Published timestamp (for content that can be published)
export const publishable = {
    publishedAt: timestamp('published_at'),
};