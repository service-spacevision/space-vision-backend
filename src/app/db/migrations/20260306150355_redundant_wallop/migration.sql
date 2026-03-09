CREATE TABLE "hr_shift_events" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"shift_id" integer NOT NULL,
	"employee_profile_id" integer NOT NULL,
	"actor_user_id" integer NOT NULL,
	"event_type" varchar(40) NOT NULL,
	"event_at" timestamp DEFAULT now() NOT NULL,
	"source" varchar(30) DEFAULT 'API' NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_shift_group_members" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"shift_group_id" integer NOT NULL,
	"employee_profile_id" integer NOT NULL,
	"added_at" timestamp DEFAULT now(),
	CONSTRAINT "hr_shift_group_members_unique" UNIQUE("shift_group_id","employee_profile_id")
);
--> statement-breakpoint
CREATE TABLE "hr_shift_groups" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"name" varchar(120) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "hr_shift_groups_org_name_unique" UNIQUE("organization_id","name")
);
--> statement-breakpoint
CREATE TABLE "hr_shift_layout_rules" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"layout_id" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"is_off_day" boolean DEFAULT false NOT NULL,
	CONSTRAINT "hr_shift_layout_rules_layout_day_unique" UNIQUE("layout_id","day_of_week")
);
--> statement-breakpoint
CREATE TABLE "hr_shift_layouts" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"shift_group_id" integer NOT NULL,
	"name" varchar(120) NOT NULL,
	"timezone" varchar(80) DEFAULT 'UTC' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "hr_shift_layouts_org_group_name_unique" UNIQUE("organization_id","shift_group_id","name")
);
--> statement-breakpoint
CREATE TABLE "hr_shifts" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"employee_profile_id" integer NOT NULL,
	"shift_group_id" integer,
	"layout_id" integer,
	"layout_rule_id" integer,
	"shift_start_at" timestamp NOT NULL,
	"shift_end_at" timestamp NOT NULL,
	"source" varchar(20) DEFAULT 'MANUAL' NOT NULL,
	"status" varchar(20) DEFAULT 'SCHEDULED' NOT NULL,
	"notes" text,
	"created_by_user_id" integer NOT NULL,
	"updated_by_user_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_time_punch_events" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"time_session_id" integer NOT NULL,
	"employee_profile_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"event_type" varchar(30) NOT NULL,
	"event_at" timestamp DEFAULT now() NOT NULL,
	"source" varchar(30) DEFAULT 'API' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "hr_policy_configs" DROP CONSTRAINT "hr_policy_configs_org_unique";--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD COLUMN "policy_id" integer;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD COLUMN "policy_assigned_at" timestamp;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD COLUMN "policy_assigned_by_user_id" integer;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD COLUMN "join_date" timestamp;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD COLUMN "is_probation_applicable" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD COLUMN "leave_eligibility_start_at" timestamp;--> statement-breakpoint
ALTER TABLE "hr_policy_configs" ADD COLUMN "policy_name" varchar(120) DEFAULT 'Default Policy' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_policy_configs" ADD COLUMN "is_applied" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_policy_configs" ADD COLUMN "applied_at" timestamp;--> statement-breakpoint
ALTER TABLE "hr_policy_configs" ADD COLUMN "allowed_break_minutes" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_time_breaks" ADD COLUMN "duration_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_time_breaks" ADD COLUMN "compliance_status" varchar(20) DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
CREATE INDEX "hr_shift_events_shift_event_idx" ON "hr_shift_events" ("shift_id","event_at");--> statement-breakpoint
CREATE INDEX "hr_shift_events_employee_event_idx" ON "hr_shift_events" ("organization_id","employee_profile_id","event_at");--> statement-breakpoint
CREATE INDEX "hr_shifts_employee_start_idx" ON "hr_shifts" ("organization_id","employee_profile_id","shift_start_at");--> statement-breakpoint
CREATE INDEX "hr_shifts_group_start_idx" ON "hr_shifts" ("organization_id","shift_group_id","shift_start_at");--> statement-breakpoint
CREATE INDEX "hr_time_punch_events_session_idx" ON "hr_time_punch_events" ("time_session_id");--> statement-breakpoint
CREATE INDEX "hr_time_punch_events_employee_idx" ON "hr_time_punch_events" ("organization_id","employee_profile_id","event_at");