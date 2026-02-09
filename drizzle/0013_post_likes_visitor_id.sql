ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "post_likes" RENAME COLUMN "user_id" TO "visitor_id";
--> statement-breakpoint
ALTER TABLE "post_likes" ALTER COLUMN "visitor_id" SET DATA TYPE varchar(255);
