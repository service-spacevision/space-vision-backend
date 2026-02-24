CREATE TABLE "hr_employee_profiles" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"employee_code" varchar(50),
	"job_title" varchar(150),
	"timezone" varchar(80),
	"probation_start_at" timestamp,
	"probation_end_at" timestamp,
	"contract_start_at" timestamp,
	"contract_end_at" timestamp,
	"reports_to_user_id" integer,
	"hr_status" varchar(20) DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "hr_employee_profiles_user_org_unique" UNIQUE("user_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "hr_leave_approvals" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"leave_request_id" integer NOT NULL,
	"requested_by_user_id" integer NOT NULL,
	"approver_user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"requested_at" timestamp DEFAULT now(),
	"decided_at" timestamp,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_leave_balances" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"employee_profile_id" integer NOT NULL,
	"leave_type_id" integer NOT NULL,
	"year" integer NOT NULL,
	"allocated_days" integer DEFAULT 0 NOT NULL,
	"used_days" integer DEFAULT 0 NOT NULL,
	"carried_over_days" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_leave_requests" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"employee_profile_id" integer NOT NULL,
	"leave_type_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"requested_by_user_id" integer NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_leave_types" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"code" varchar(30) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"requires_notice_days" integer,
	"annual_allocation_days" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "hr_leave_types_org_code_unique" UNIQUE("organization_id","code")
);
--> statement-breakpoint
CREATE TABLE "hr_policy_configs" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL CONSTRAINT "hr_policy_configs_org_unique" UNIQUE,
	"casual_leave_notice_days" integer DEFAULT 14 NOT NULL,
	"max_consecutive_leave_days" integer DEFAULT 3 NOT NULL,
	"probation_days" integer DEFAULT 90 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_time_break_approvals" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"time_break_id" integer NOT NULL,
	"requested_by_user_id" integer NOT NULL,
	"approver_user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"requested_at" timestamp DEFAULT now(),
	"decided_at" timestamp,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_time_breaks" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"time_session_id" integer NOT NULL,
	"break_start_at" timestamp NOT NULL,
	"break_end_at" timestamp,
	"status" varchar(20) DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_time_session_approvals" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"time_session_id" integer NOT NULL,
	"requested_by_user_id" integer NOT NULL,
	"approver_user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"requested_at" timestamp DEFAULT now(),
	"decided_at" timestamp,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_time_sessions" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"employee_profile_id" integer NOT NULL,
	"clock_in_at" timestamp NOT NULL,
	"clock_out_at" timestamp,
	"status" varchar(20) DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mikrotik_permissions" (
	"id" serial PRIMARY KEY,
	"vessel_id" integer NOT NULL,
	"vessel_name" text NOT NULL,
	"mikrotik_user_name" text NOT NULL,
	"router_ip" text NOT NULL,
	"router_port" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"assigned_by" integer NOT NULL,
	"type" text NOT NULL,
	"profile" text,
	"server" text,
	"limit_bytes_total" numeric,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mikrotik_usage_alltime" (
	"id" serial PRIMARY KEY,
	"vessel_name" text NOT NULL,
	"vessel_id" integer NOT NULL,
	"username" text NOT NULL,
	"uptime" text,
	"rx_mb" integer DEFAULT 0 NOT NULL,
	"tx_mb" integer DEFAULT 0 NOT NULL,
	"total_allowed_mb" integer DEFAULT 5000 NOT NULL,
	"percentage_used" numeric(5,1) DEFAULT '0.0' NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_router_rx_mb" integer DEFAULT 0 NOT NULL,
	"last_router_tx_mb" integer DEFAULT 0 NOT NULL,
	"lifetime_rx_mb" integer DEFAULT 0 NOT NULL,
	"lifetime_tx_mb" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "group_access" DROP CONSTRAINT "group_access_group_id_vessel_groups_id_fk";--> statement-breakpoint
ALTER TABLE "mikrotik_vessels" DROP CONSTRAINT "mikrotik_vessels_vessel_name_unique";--> statement-breakpoint
ALTER TABLE "mikrotik_usage_session" ADD COLUMN "vessel_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "permitted_vessel_groups" integer[];--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "access_token" text;--> statement-breakpoint
ALTER TABLE "pins" ADD COLUMN "type" text DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "pins" ADD COLUMN "vessel_name" text;--> statement-breakpoint
ALTER TABLE "pins" ADD COLUMN "mikrotik_vessel_id" integer;--> statement-breakpoint
ALTER TABLE "pins" ADD COLUMN "mikrotik_vessel_name" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "mfa_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "mfa_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "organization_name" varchar(100);--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "permissions" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "permitted_vessel_groups" integer[] DEFAULT ARRAY[]::integer[] NOT NULL;--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "permitted_mikrotik_vessels" integer[] DEFAULT ARRAY[]::integer[] NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "organization_name" varchar(255);--> statement-breakpoint
ALTER TABLE "vessel_groups" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "vessels" ADD COLUMN "api_port" integer;--> statement-breakpoint
ALTER TABLE "vessels" ADD COLUMN "is_mikrotik" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "vessels" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "pins" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "group_access" ALTER COLUMN "role" SET DATA TYPE integer USING "role"::integer;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "scope" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "scope" SET DATA TYPE varchar USING "scope"::varchar;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "scope" SET DEFAULT 'own';--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "scope" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "section" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "section" SET DATA TYPE varchar USING "section"::varchar;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "section" SET DEFAULT 'organization';--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "section" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "category" SET DATA TYPE varchar USING "category"::varchar;--> statement-breakpoint
ALTER TABLE "pins" ALTER COLUMN "vessel_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pins" ALTER COLUMN "kitp" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "roles_permission" ALTER COLUMN "api_permissions" SET DATA TYPE jsonb USING "api_permissions"::jsonb;--> statement-breakpoint
ALTER TABLE "roles_permission" ALTER COLUMN "component_permissions" SET DATA TYPE jsonb USING "component_permissions"::jsonb;--> statement-breakpoint
ALTER TABLE "roles_permission" ALTER COLUMN "navigation_permissions" SET DATA TYPE jsonb USING "navigation_permissions"::jsonb;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "token" SET DATA TYPE text USING "token"::text;--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "organization_id" SET DATA TYPE integer USING "organization_id"::integer;--> statement-breakpoint
CREATE UNIQUE INDEX "hr_leave_approvals_leave_request_unique" ON "hr_leave_approvals" ("leave_request_id");--> statement-breakpoint
CREATE INDEX "hr_leave_approvals_approver_idx" ON "hr_leave_approvals" ("organization_id","approver_user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_leave_balances_emp_type_year_unique" ON "hr_leave_balances" ("organization_id","employee_profile_id","leave_type_id","year");--> statement-breakpoint
CREATE INDEX "hr_leave_balances_org_employee_idx" ON "hr_leave_balances" ("organization_id","employee_profile_id","year");--> statement-breakpoint
CREATE INDEX "hr_leave_requests_org_employee_idx" ON "hr_leave_requests" ("organization_id","employee_profile_id","status");--> statement-breakpoint
CREATE INDEX "hr_leave_requests_org_date_idx" ON "hr_leave_requests" ("organization_id","start_date","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_time_break_approvals_time_break_unique" ON "hr_time_break_approvals" ("time_break_id");--> statement-breakpoint
CREATE INDEX "hr_time_break_approvals_approver_idx" ON "hr_time_break_approvals" ("organization_id","approver_user_id","status");--> statement-breakpoint
CREATE INDEX "hr_time_breaks_session_idx" ON "hr_time_breaks" ("time_session_id");--> statement-breakpoint
CREATE INDEX "hr_time_breaks_org_session_idx" ON "hr_time_breaks" ("organization_id","time_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_time_session_approvals_time_session_unique" ON "hr_time_session_approvals" ("time_session_id");--> statement-breakpoint
CREATE INDEX "hr_time_session_approvals_approver_idx" ON "hr_time_session_approvals" ("organization_id","approver_user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_time_sessions_single_open_per_employee" ON "hr_time_sessions" ("organization_id","employee_profile_id") WHERE "clock_out_at" IS NULL;--> statement-breakpoint
CREATE INDEX "hr_time_sessions_org_employee_idx" ON "hr_time_sessions" ("organization_id","employee_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_vessel_username" ON "mikrotik_usage_alltime" ("vessel_name","username");--> statement-breakpoint
ALTER TABLE "mikrotik_permissions" ADD CONSTRAINT "mikrotik_permissions_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");--> statement-breakpoint
ALTER TABLE "mikrotik_permissions" ADD CONSTRAINT "mikrotik_permissions_assigned_by_users_id_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "pins" ADD CONSTRAINT "pins_vessel_id_mikrotik_vessels_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "mikrotik_vessels"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "pins" ADD CONSTRAINT "pins_generated_by_users_id_fkey" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "pins" ADD CONSTRAINT "pins_mikrotik_vessel_id_mikrotik_vessels_id_fkey" FOREIGN KEY ("mikrotik_vessel_id") REFERENCES "mikrotik_vessels"("id") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
DROP TYPE "permission_category";--> statement-breakpoint
DROP TYPE "permission_scope";--> statement-breakpoint
DROP TYPE "permission_section";