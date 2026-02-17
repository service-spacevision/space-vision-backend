CREATE TABLE "bluetide_telemetry" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_number" text NOT NULL,
	"device_id" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"downlink_throughput_mbps" real,
	"uplink_throughput_mbps" real,
	"ping_drop_rate_avg" real,
	"ping_latency_ms_avg" integer,
	"obstruction_percent_time" real,
	"uptime_seconds" integer,
	"signal_quality_percent" real,
	"h3_cell_id" text,
	"latitude" double precision,
	"longitude" double precision,
	"seconds_until_swupdate_reboot_possible" integer,
	"running_software_version" text,
	"active_alert_count" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bluetide_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"kitp" text NOT NULL,
	"name" text,
	"usage_gb" real,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "group_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" integer NOT NULL,
	"group_id" integer[] NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mikrotik_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"vessel_id" integer NOT NULL,
	"vessel_name" text NOT NULL,
	"mikrotik_vessel_id" text,
	"mikrotik_vessel_name" text,
	"mikrotik_user_name" text NOT NULL,
	"router_ip" text NOT NULL,
	"router_port" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"assigned_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mikrotik_usage_alltime" (
	"id" serial PRIMARY KEY NOT NULL,
	"vessel_name" text NOT NULL,
	"vessel_id" integer NOT NULL,
	"username" text NOT NULL,
	"uptime" text,
	"rx_mb" integer DEFAULT 0 NOT NULL,
	"tx_mb" integer DEFAULT 0 NOT NULL,
	"total_allowed_mb" integer DEFAULT 5000 NOT NULL,
	"percentage_used" numeric(5, 1) DEFAULT '0.0' NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mikrotik_usage_session" (
	"id" serial PRIMARY KEY NOT NULL,
	"vessel_name" text NOT NULL,
	"vessel_id" integer NOT NULL,
	"username" text NOT NULL,
	"ip" text,
	"mac" text,
	"uptime" text,
	"rx_mb" integer DEFAULT 0 NOT NULL,
	"tx_mb" integer DEFAULT 0 NOT NULL,
	"total_allowed_mb" integer DEFAULT 5000 NOT NULL,
	"percentage_used" numeric(5, 1) DEFAULT '0.0' NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mikrotik_vessels" (
	"id" serial PRIMARY KEY NOT NULL,
	"vessel_name" text NOT NULL,
	"router_ip" text,
	"api_port" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"logo" text,
	"subscription_id" text,
	"parent_org_name" text,
	"permitted_vessel_groups" integer[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "organizations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"resource" varchar(255) NOT NULL,
	"action" varchar(100) NOT NULL,
	"scope" varchar DEFAULT 'own' NOT NULL,
	"section" varchar DEFAULT 'organization' NOT NULL,
	"category" varchar NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "pins" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text DEFAULT 'other' NOT NULL,
	"vessel_id" integer,
	"vessel_name" text,
	"kitp" text,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"generated_by" integer NOT NULL,
	"mikrotik_vessel_id" integer,
	"mikrotik_vessel_name" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles_permission" (
	"id" serial PRIMARY KEY NOT NULL,
	"roleId" integer NOT NULL,
	"api_permissions" jsonb,
	"component_permissions" jsonb,
	"navigation_permissions" jsonb,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_permission_roleId_unique" UNIQUE("roleId")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text,
	"current_db" varchar(100),
	"session_data" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"is_active" boolean DEFAULT true,
	"mfa_enabled" boolean DEFAULT false,
	"mfa_verified" boolean DEFAULT false,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "starlink_usage" (
	"id" serial NOT NULL,
	"date_key" text NOT NULL,
	"kit_number" text NOT NULL,
	"vessel_name" text,
	"mobile_priority_gb" real,
	"standard_gb" real,
	"chargebee_subscription_id" text,
	"usage_limit_gb" real,
	"public_ip_enabled" boolean,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "starlink_usage_date_key_kit_number_pk" PRIMARY KEY("date_key","kit_number")
);
--> statement-breakpoint
CREATE TABLE "sync_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"partition_key" text DEFAULT 'default' NOT NULL,
	"cursor_type" text DEFAULT 'timestamp' NOT NULL,
	"cursor_value" text,
	"last_synced_at" timestamp with time zone,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "telephony_dids" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"channels_included" integer,
	"dedicated_channels" integer,
	"channels_included_count" integer,
	"dedicated_channels_count" integer,
	"blocked" boolean DEFAULT false,
	"terminated" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "telephony_dids_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(200),
	"description" text,
	"is_active" boolean DEFAULT true,
	"is_system" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" varchar(100),
	"organization_name" varchar(100),
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"permitted_vessel_groups" integer[] DEFAULT ARRAY[]::integer[] NOT NULL,
	"organization_id" integer,
	CONSTRAINT "user_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"full_name" varchar(200),
	"username" varchar(100),
	"role_id" integer,
	"is_active" boolean DEFAULT true,
	"is_email_verified" boolean DEFAULT false,
	"email_verification_token" varchar(255),
	"password_reset_token" varchar(255),
	"password_reset_expires" timestamp,
	"mfa_enabled" boolean DEFAULT false,
	"mfa_secret" text,
	"organization_name" varchar(255),
	"last_login_at" timestamp,
	"profile_picture" varchar(500),
	"bio" text,
	"preferences" jsonb,
	"organization_id" integer,
	"created_by" varchar(100),
	"updated_by" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vessel_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_name" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vessel_groups_group_name_unique" UNIQUE("group_name")
);
--> statement-breakpoint
CREATE TABLE "vessels" (
	"id" serial PRIMARY KEY NOT NULL,
	"vesselskit_number" text NOT NULL,
	"name" text,
	"subscription_plan" text,
	"group_id" integer,
	"device_id" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vessels_vesselskit_number_unique" UNIQUE("vesselskit_number")
);
--> statement-breakpoint
ALTER TABLE "mikrotik_permissions" ADD CONSTRAINT "mikrotik_permissions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mikrotik_permissions" ADD CONSTRAINT "mikrotik_permissions_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pins" ADD CONSTRAINT "pins_vessel_id_mikrotik_vessels_id_fk" FOREIGN KEY ("vessel_id") REFERENCES "public"."mikrotik_vessels"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pins" ADD CONSTRAINT "pins_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pins" ADD CONSTRAINT "pins_mikrotik_vessel_id_mikrotik_vessels_id_fk" FOREIGN KEY ("mikrotik_vessel_id") REFERENCES "public"."mikrotik_vessels"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_group_id_vessel_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."vessel_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unq_vessel_username" ON "mikrotik_usage_alltime" USING btree ("vessel_name","username");--> statement-breakpoint
CREATE UNIQUE INDEX "sync_state_source_partition_unique" ON "sync_state" USING btree ("source","partition_key");