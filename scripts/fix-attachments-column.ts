import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not set in environment variables.');
    process.exit(1);
}

const sql = postgres(connectionString);

async function fixTableRef(tableName: string, columnName: string) {
    try {
        console.log(`Checking ${tableName}.${columnName} type...`);
        const result = await sql`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = ${tableName} AND column_name = ${columnName};
        `;

        if (result.length === 0) {
            console.log(`Column ${tableName}.${columnName} does not exist. Ignoring.`);
            return;
        }

        const currentType = result[0].data_type;
        console.log(`Current type of ${tableName}.${columnName}: ${currentType}`);

        if (currentType !== 'jsonb') {
            console.log(`Converting ${tableName}.${columnName} to jsonb...`);
            // We use a try-catch block for the ALTER command to handle potential casting errors gracefully
            try {
                // Try simple cast first
                await sql`ALTER TABLE ${sql(tableName)} ALTER COLUMN ${sql(columnName)} TYPE jsonb USING ${sql(columnName)}::jsonb`;
                console.log(`Successfully converted ${tableName}.${columnName} to jsonb.`);
            } catch (alterError: unknown) {
                const errorMessage = alterError instanceof Error ? alterError.message : String(alterError);
                console.error(`Failed to simple cast ${tableName}.${columnName} to jsonb:`, errorMessage);

                // If simple cast fails (e.g. invalid JSON syntax in text), we might need to be more aggressive or warn.
                // For now, let's try to default to valid empty JSON array if the content is "empty" or invalid?
                // Or maybe just try to wrap it as a string if it fails?
                // Let's try to handle the specific case where it might be a simple URL string that isn't quoted as JSON string.
                // e.g. http://example.com is invalid JSON. "http://example.com" is valid JSON.

                console.log('Attempting to fix by treating content as JSON string if possible, or nulling invalid data...');
                // CAUTION: This might lose data if it's garbage. 
                // But typically for this app, we probably want to assume it's [] or null if it fails.

                // Let's try to update invalid JSON to null, then alter?
                // Or use a CASE statement in USING.

                // Let's try a safer USING clause: 
                // "USING CASE WHEN attachments IS NULL OR attachments = '' THEN '[]'::jsonb ELSE to_jsonb(attachments) END" 
                // Wait, to_jsonb(text) creates a JSON string.

                console.log('Trying to convert using to_jsonb (wrapping value as JSON string)...');
                await sql`ALTER TABLE ${sql(tableName)} ALTER COLUMN ${sql(columnName)} TYPE jsonb USING to_jsonb(${sql(columnName)})`;
                console.log(`Successfully converted ${tableName}.${columnName} to jsonb (wrapped as JSON string).`);
            }
        } else {
            console.log(`${tableName}.${columnName} is already jsonb.`);
        }

    } catch (error) {
        console.error(`Error checking/fixing ${tableName}:`, error);
    }
}

async function main() {
    try {
        await fixTableRef('assignments', 'attachments');
        await fixTableRef('assignment_submissions', 'attachments');
    } catch (error) {
        console.error('Script failed:', error);
    } finally {
        await sql.end();
    }
}

main();
