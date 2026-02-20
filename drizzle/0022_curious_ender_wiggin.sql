ALTER TABLE "students" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "nickname" text;