ALTER TABLE "course_payments" DROP CONSTRAINT "course_payments_student_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "course_payments" ADD CONSTRAINT "course_payments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;