import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Use globalThis to maintain connection across hot reloads in development
const globalForDb = globalThis as unknown as {
    postgresClient: postgres.Sql<Record<string, unknown>> | undefined;
};

const client =
    globalForDb.postgresClient ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== 'production') {
    globalForDb.postgresClient = client;
}

export const db = drizzle(client, { schema });
