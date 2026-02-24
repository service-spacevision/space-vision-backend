ALTER TABLE "hr_employee_profiles" ADD COLUMN IF NOT EXISTS "join_date" timestamp;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD COLUMN IF NOT EXISTS "is_probation_applicable" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD COLUMN IF NOT EXISTS "leave_eligibility_start_at" timestamp;
