ALTER TABLE "hr_employee_profiles" ADD COLUMN IF NOT EXISTS "policy_id" integer;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD COLUMN IF NOT EXISTS "policy_assigned_at" timestamp;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD COLUMN IF NOT EXISTS "policy_assigned_by_user_id" integer;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hr_employee_profiles_policy_idx" ON "hr_employee_profiles" ("organization_id","policy_id");
