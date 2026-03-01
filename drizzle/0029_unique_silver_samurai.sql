ALTER TABLE "class_attendances" DROP CONSTRAINT "class_attendances_student_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "class_attendances" ADD CONSTRAINT "class_attendances_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;