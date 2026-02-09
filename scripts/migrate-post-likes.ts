import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function run() {
  try {
    await sql`ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_users_id_fk`;
    console.log("Dropped FK constraint");
    await sql`ALTER TABLE post_likes RENAME COLUMN user_id TO visitor_id`;
    console.log("Renamed column user_id -> visitor_id");
    await sql`ALTER TABLE post_likes ALTER COLUMN visitor_id SET DATA TYPE varchar(255)`;
    console.log("Changed column type to varchar(255)");
    console.log("Migration complete!");
  } catch (e: any) {
    console.error("Error:", e.message);
  } finally {
    await sql.end();
  }
}

run();
