ALTER TABLE "students" ADD COLUMN "student_number" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "student_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "registration_date" date DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "gender" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "place_of_birth" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "education" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "occupation" text;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_student_id_unique" UNIQUE("student_id");