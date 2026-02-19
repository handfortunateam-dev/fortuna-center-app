ALTER TABLE "class_enrollments" DROP CONSTRAINT "class_enrollments_student_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;