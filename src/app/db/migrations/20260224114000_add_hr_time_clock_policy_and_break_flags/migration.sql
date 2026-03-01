ALTER TABLE "hr_policy_configs" ADD COLUMN IF NOT EXISTS "allowed_break_minutes" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_time_breaks" ADD COLUMN IF NOT EXISTS "duration_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_time_breaks" ADD COLUMN IF NOT EXISTS "compliance_status" varchar(20) DEFAULT 'PENDING' NOT NULL;
