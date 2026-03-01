CREATE TABLE IF NOT EXISTS "hr_time_punch_events" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"time_session_id" integer NOT NULL,
	"employee_profile_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"event_type" varchar(30) NOT NULL,
	"event_at" timestamp DEFAULT now() NOT NULL,
	"source" varchar(30) DEFAULT 'API' NOT NULL,
	"created_at" timestamp DEFAULT now()
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hr_time_punch_events_session_idx" ON "hr_time_punch_events" ("time_session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hr_time_punch_events_employee_idx" ON "hr_time_punch_events" ("organization_id","employee_profile_id","event_at");
