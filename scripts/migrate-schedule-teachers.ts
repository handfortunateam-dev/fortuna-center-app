/**
 * Data migration script: Move teachers from class_schedules to schedule_teachers junction table.
 *
 * What this does:
 * 1. Reads all class_schedules that have a teacher_id
 * 2. Groups them by (class_id, day_of_week, start_time, end_time) to find duplicates
 * 3. For each group: keeps the first record, deletes duplicates
 * 4. Moves teacher assignments to schedule_teachers junction table
 * 5. Updates class_sessions.schedule_id from deleted duplicates to the kept record
 * 6. Sets class_sessions.teacher_id from the old schedule's teacher_id
 *
 * Run with: npx tsx scripts/migrate-schedule-teachers.ts
 */
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

interface ScheduleRow {
  id: string;
  class_id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
  notes: string | null;
  created_by: string | null;
}

async function run() {
  try {
    console.log("Starting schedule-teachers migration...");

    // 1. Check if teacher_id column still exists in class_schedules
    const columns = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'class_schedules' AND column_name = 'teacher_id'
    `;

    if (columns.length === 0) {
      console.log("teacher_id column already removed from class_schedules. Skipping data migration.");
      await sql.end();
      return;
    }

    // 2. Read all existing schedules
    const schedules = await sql<ScheduleRow[]>`
      SELECT id, class_id, teacher_id, day_of_week, start_time, end_time, location, notes, created_by
      FROM class_schedules
      ORDER BY created_at ASC
    `;

    console.log(`Found ${schedules.length} schedule records.`);

    if (schedules.length === 0) {
      console.log("No schedules to migrate.");
      await sql.end();
      return;
    }

    // 3. Group by (class_id, day_of_week, start_time, end_time)
    const groups = new Map<string, ScheduleRow[]>();
    for (const s of schedules) {
      const key = `${s.class_id}-${s.day_of_week}-${s.start_time}-${s.end_time}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(s);
    }

    console.log(`Grouped into ${groups.size} unique time slots.`);

    let movedTeachers = 0;
    let deletedDuplicates = 0;
    let updatedSessions = 0;

    // 4. Process each group
    for (const [key, group] of groups) {
      const keepRecord = group[0]; // Keep the first one
      const duplicates = group.slice(1); // Rest are duplicates

      // Collect all unique teacher IDs from the group
      const teacherIds = [...new Set(group.map(s => s.teacher_id))];

      // Insert into schedule_teachers for the kept record
      for (const teacherId of teacherIds) {
        // Check if already exists
        const existing = await sql`
          SELECT id FROM schedule_teachers
          WHERE schedule_id = ${keepRecord.id} AND teacher_id = ${teacherId}
        `;
        if (existing.length === 0) {
          await sql`
            INSERT INTO schedule_teachers (id, schedule_id, teacher_id, assigned_at, assigned_by)
            VALUES (gen_random_uuid(), ${keepRecord.id}, ${teacherId}, NOW(), ${keepRecord.created_by})
          `;
          movedTeachers++;
        }
      }

      // For each duplicate, re-point its sessions to the kept record and set teacher_id
      for (const dup of duplicates) {
        // Update sessions: point to kept record and set teacher_id
        const result = await sql`
          UPDATE class_sessions
          SET schedule_id = ${keepRecord.id}, teacher_id = ${dup.teacher_id}
          WHERE schedule_id = ${dup.id}
        `;
        updatedSessions += result.count;

        // Delete the duplicate schedule
        await sql`DELETE FROM class_schedules WHERE id = ${dup.id}`;
        deletedDuplicates++;
      }

      // Also set teacher_id on sessions that were already pointing to the kept record
      await sql`
        UPDATE class_sessions
        SET teacher_id = ${keepRecord.teacher_id}
        WHERE schedule_id = ${keepRecord.id} AND teacher_id IS NULL
      `;
    }

    console.log(`Migration complete!`);
    console.log(`  - Moved ${movedTeachers} teacher assignments to schedule_teachers`);
    console.log(`  - Deleted ${deletedDuplicates} duplicate schedule records`);
    console.log(`  - Updated ${updatedSessions} session records`);
  } catch (e: any) {
    console.error("Migration error:", e.message);
  } finally {
    await sql.end();
  }
}

run();
