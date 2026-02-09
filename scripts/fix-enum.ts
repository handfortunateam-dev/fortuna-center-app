import postgres from 'postgres';

// Bun automatically generates process.env from .env files
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not set in environment variables.');
    process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
    try {
        console.log('Checking session_status enum...');

        // Check current values
        const result = await sql`
      SELECT enumlabel
      FROM pg_enum
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
      WHERE pg_type.typname = 'session_status';
    `;

        console.log('Current enum values in DB:', result.map(r => r.enumlabel));

        const hasScheduled = result.some(r => r.enumlabel === 'scheduled');

        if (!hasScheduled) {
            console.log('Adding "scheduled" value to session_status enum...');
            // Execute ALTER TYPE inside a transaction block is not always supported or necessary for ALTER TYPE ADD VALUE
            // It cannot be run in a transaction block (sometimes). postgres.js doesn't wrap in transaction by default unless sql.begin is used.
            await sql`ALTER TYPE session_status ADD VALUE 'scheduled'`;
            console.log('Successfully added "scheduled" to session_status.');
        } else {
            console.log('"scheduled" already exists in session_status enum.');
        }

    } catch (error) {
        console.error('Error updating enum:', error);
    } finally {
        await sql.end();
    }
}

main();
