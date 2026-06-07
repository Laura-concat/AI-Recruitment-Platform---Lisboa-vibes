ALTER TABLE "candidate_profiles" ALTER COLUMN "is_visible" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "test_status" text DEFAULT 'not_taken';--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "test_score" integer;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "test_taken_at" timestamp;